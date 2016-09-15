/* @flow */
'use strict'

import React from 'react'

import {
  Alert,
  AsyncStorage,
  InteractionManager,
  ListView,
  NativeModules,
  Platform,
  StyleSheet,
  View
} from 'react-native'

import _ from 'lodash'

import DiscourseUtils from '../DiscourseUtils'
import Site from '../site'
import Components from './NotificationsScreenComponents'
import ProgressBar from '../ProgressBar'
import colors from '../colors'

class NotificationsScreen extends React.Component {

  static replyTypes = [1, 6, 9, 15, 16, 17]

  constructor(props) {
    super(props)

    let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

    this.state =  {
      renderPlaceholderOnly: true,
      progress: 0,
      selectedIndex: 0,
      dataSource: dataSource.cloneWithRows([])
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({renderPlaceholderOnly: false})
    })
  }

  componentWillMount() {
    this._fetchNotifications(NotificationsScreen.replyTypes)
  }

  render() {
    if (this.state.renderPlaceholderOnly) {
      return (
        <View style={styles.container}>
          <Components.NavigationBar onDidPressRightButton={() => {}} />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Components.NavigationBar
          onDidPressRightButton={() => this._onDidPressRightButton()}
        />
        <ProgressBar progress={this.state.progress} />
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderHeader={() => this._renderListHeader()}
          renderRow={(rowData) => this._renderListRow(rowData)}
          style={styles.notificationsList}
        />
      </View>
    )
  }

  _openNotificationForSite(notification, site) {
    // TODO mark as read
    let url = DiscourseUtils.endpointForSiteNotification(site, notification)
    this.props.openUrl(url)
  }

  _onDidPressRightButton() {
    this.props.navigator.pop()
  }

  _renderListRow(rowData) {
    return (
      <Components.Row
        site={rowData.site}
        onClick={() => this._openNotificationForSite(rowData.notification, rowData.site)}
        notification={rowData.notification} />
    )
  }

  _renderListHeader() {
    return (
      <Components.Filter
        selectedIndex={this.state.selectedIndex}
        onChange={(index) => {
          let types = index === 0 ? NotificationsScreen.replyTypes : undefined
          this._fetchNotifications(types)
          this.setState({selectedIndex: index})
        }}
      />
    )
  }

  _fetchNotifications(notificationTypes) {

    this.setState({progress: Math.random() * 0.4})

    this.props.siteManager.notifications(notificationTypes)
        .then(notifications => {
                setTimeout(()=>{
                  this.setState({progress: 0})
                },400)
                this.setState({
                  dataSource: this.state.dataSource.cloneWithRows(notifications),
                  progress: 1
                })
        })

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBackground
  },
  notificationsList: {
    flex: 1
  }
})

export default NotificationsScreen