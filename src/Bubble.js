import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import MessageText from './MessageText';
import MessageImage from './MessageImage';
import Time from './Time';

import { isSameUser, isSameDay, warnDeprecated } from './utils';

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
  }

  handleBubbleToNext() {
    if (isSameUser(this.props.currentMessage, this.props.nextMessage) && isSameDay(this.props.currentMessage, this.props.nextMessage)) {
      return StyleSheet.flatten([styles[this.props.position].containerToNext, this.props.containerToNextStyle[this.props.position]]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (isSameUser(this.props.currentMessage, this.props.previousMessage) && isSameDay(this.props.currentMessage, this.props.previousMessage)) {
      return StyleSheet.flatten([styles[this.props.position].containerToPrevious, this.props.containerToPreviousStyle[this.props.position]]);
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps}/>;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps}/>;
    }
    return null;
  }

  renderTicks() {
    const {currentMessage} = this.props;
    if (this.props.renderTicks) {
        return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
        return;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
        </View>
      )
    }
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const {containerStyle, wrapperStyle, ...timeProps} = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps}/>;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context);
    } else {
      if (this.props.currentMessage.text) {
        const options = [
          'Copy Text',
          'Cancel',
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions({
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.text);
              break;
          }
        });
      }
    }
  }

  getContainerStyle(){
    if(this.props.currentMessage.location || this.props.currentMessage.quickreplies){
      return this.props.customViewContainerStyle[this.props.position]
    }else{
      return this.props.containerStyle[this.props.position]
    }
  }

  getWrapperStyle(){
    if(this.props.currentMessage.location || this.props.currentMessage.quickreplies){
      return this.props.customViewWrapperStyle[this.props.position]
    }else{
      return this.props.wrapperStyle[this.props.position]
    }
  }

  render() {
    var containerStyleConditional = this.getContainerStyle()
    var wrapperStyleConditional = this.getWrapperStyle()

    return (
      <View style={[styles[this.props.position].container, containerStyleConditional]}>
        <View style={[styles[this.props.position].wrapper, wrapperStyleConditional, this.handleBubbleToNext(), this.handleBubbleToPrevious()]}>
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            {...this.props.touchableProps}
          >
            <View>
              {this.renderCustomView()}
              {this.renderMessageImage()}
              {this.renderMessageText()}
              <View style={styles.bottom}>
                {this.renderTime()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 0,
    },
    containerToPrevious: {
      borderTopLeftRadius: 0,
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#0084ff',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 0,
    },
    containerToPrevious: {
      borderTopRightRadius: 0,
    },
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: 'transparent',
    color: 'white',
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  }
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  customViewContainerStyle:{},
  customViewWrapperStyle:{},
  wrapperStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  //TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
};

Bubble.propTypes = {
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  customViewContainerStyle: PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  customViewWrapperStyle: PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  //TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
};
