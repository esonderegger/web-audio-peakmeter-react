import React from 'react';

export default class PeakMeter extends React.Component {
  constructor(props) {
    super(props);
    const c = this.props.channels;
    this.channelCount = c;
    this.meterNode = this.props.audioCtx.createScriptProcessor(2048, c, c);
    // this.props.sourceNode.connect(meterNode);
    this.meterNode.connect(this.props.audioCtx.destination);
    this.channelPeaks = [];
    this.maskSizes = [];
    this.textLabels = [];
    for (let i = 0; i < c; i++) {
      this.channelPeaks.push(0);
      this.maskSizes.push(100);
      this.textLabels.push('-∞');
    }
    this.clearPeaks = this.clearPeaks.bind(this);
    this.maskSize = this.maskSize.bind(this);
    this.updateMeter = this.updateMeter.bind(this);
    this.paintMeter = this.paintMeter.bind(this);
    this.meterNode.onaudioprocess = this.updateMeter;
  }
  componentDidMount() {
    this.paintMeter();
    this.connectSourceNodes();
  }
  connectSourceNodes() {
    this.props.sourceNodes.forEach(sourceNode => {
      sourceNode.connect(this.meterNode);
    });
  }
  getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  }
  dbFromFloat(floatVal) {
    return this.getBaseLog(10, floatVal) * 20;
  }
  clearPeaks() {
    for (let i = 0; i < this.channelCount; i++) {
      this.channelPeaks[i] = 0;
      this.textLabels[i] = '-∞';
    }
  }
  maskSize(floatVal) {
    const dbRange = -42;
    const returnVal = Math.floor(this.dbFromFloat(floatVal) * 100 / dbRange);
    if (returnVal > 100) {
      return 100;
    } else {
      return returnVal;
    }
  }
  updateMeter(audioProcessingEvent) {
    const inputBuffer = audioProcessingEvent.inputBuffer;
    let i = 0;
    const channelData = [];
    const channelMaxes = [];
    for (i = 0; i < this.channelCount; i++) {
      channelData[i] = inputBuffer.getChannelData(i);
      channelMaxes[i] = 0.0;
    }
    for (let sample = 0; sample < inputBuffer.length; sample++) {
      for (i = 0; i < this.channelCount; i++) {
        if (Math.abs(channelData[i][sample]) > channelMaxes[i]) {
          channelMaxes[i] = Math.abs(channelData[i][sample]);
        }
      }
    }
    for (i = 0; i < this.channelCount; i++) {
      this.maskSizes[i] = this.maskSize(channelMaxes[i]);
      if (channelMaxes[i] > this.channelPeaks[i]) {
        this.channelPeaks[i] = channelMaxes[i];
        this.textLabels[i] = this.dbFromFloat(channelMaxes[i]).toFixed(1);
      }
    }
  }
  paintMeter() {
    for (let i = 0; i < this.channelCount; i++) {
      if (this.props.vertical) {
        this['mask' + i].style.height = this.maskSizes[i] + '%';
      } else {
        this['mask' + i].style.width = this.maskSizes[i] + '%';
      }
      this['peak' + i].textContent = this.textLabels[i];
    }
    window.requestAnimationFrame(this.paintMeter);
  }
  render() {
    const colors = ['red 1%', '#ff0 16%', 'lime 45%', '#080 100%'];
    const styles = {
      outer: {
        backgroundColor: '#222',
        padding: '5px',
        display: 'flex',
      },
      bars: {
        width: 'calc(100% - 30px)',
      },
      text: {
        width: '30px',
      },
      meter: {
        padding: '0 5px',
      },
      gradient: {
        backgroundImage: 'linear-gradient(to left, ' + colors.join(', ') + ')',
        position: 'relative',
        height: '15px',
        marginBottom: '5px',
      },
      mask: {
        backgroundColor: '#222',
        width: '100%',
        height: '100%',
        position: 'absolute',
        right: '0',
        transition: 'width 0.1s',
      },
      labels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '6px',
        color: '#ccc',
      },
      label: {
        width: '10px',
        textAlign: 'center',
      },
      textPeak: {
        fontSize: '10px',
        color: '#ccc',
        textAlign: 'center',
        height: '15px',
        lineHeight: '15px',
        marginBottom: '5px',
      },
    };
    const labels = [-42, -36, -30, -24, -18, -12, -6, 0];
    return (
      <div style={styles.outer} onClick={this.clearPeaks}>
        <div style={styles.bars}>
          <div style={styles.meter}>
            {this.channelPeaks.map((channel, i) => {
              return (
                <div key={'gradient' + i} style={styles.gradient}>
                  <div
                    style={styles.mask}
                    ref={(mask) => { this['mask' + i] = mask; }}
                  />
                </div>
              );
            })}
          </div>
          <div style={styles.labels}>
            {labels.map((label, i) => {
              return (
                <div key={'label' + i} style={styles.label}>{label}</div>
              );
            })}
          </div>
        </div>
        <div style={styles.text}>
          {this.textLabels.map((peak, i) => {
            return (
              <div
                key={'peak' + i}
                style={styles.textPeak}
                ref={(peak) => { this['peak' + i] = peak; }}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
