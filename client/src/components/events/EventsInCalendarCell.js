import React, { Component } from "react";
import PropTypes from "prop-types";
import isEmpty from "../../validation/is-empty";
import moment from "moment";
import FormModal from "../modal/FormModal";
import Tooltip from "../modal/Tooltip";

class EventInCalendarCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showTooltip: false,
      eventInModal: {}
    };
  }

  showModal = eventInModal => e => {
    e.preventDefault();
    this.setState({ showModal: true, eventInModal });
  };

  hideModal = e => {
    if (e) e.preventDefault();
    this.setState({ showModal: false, eventInModal: {} });
  };

  format = date => {
    return moment(date)
      .utc()
      .format("YYYY-MM-DD");
  };

  showTooltip = () => {
    this.setState({ showTooltip: true });
  };

  hideTooltip = () => {
    this.setState({ showTooltip: false });
  };

  match = (a, b) => a === b;

  render() {
    const { multiDayEvents, notMultiDayEvents } = this.props;
    let renderedMultiDayEvents;
    let renderedNotMultiDayEvents;

    if (!isEmpty(multiDayEvents)) {
      renderedMultiDayEvents = (
        <span>
          {multiDayEvents.map((event, index) => {
            return (
              <div key={index}>
                <a
                  key={event._id}
                  href="!#"
                  className="calendar-event bg-success text-white d-block p-1 mb-1 mx-auto"
                  onClick={this.showModal(event)}
                  onMouseEnter={this.showTooltip}
                  onMouseLeave={this.hideTooltip}
                >
                  {this.match(
                    this.format(event.startDate),
                    this.format(this.props.cellDate)
                  )
                    ? event.name
                    : "\u00A0"}
                </a>
                {this.state.showModal &&
                this.state.eventInModal._id === event._id ? (
                  <FormModal
                    key={event._id + index}
                    disabled={true}
                    eventToDisplay={this.state.eventInModal}
                    hideModal={this.hideModal}
                    formType={"READONLY"}
                  />
                ) : null}
              </div>
            );
          })}
        </span>
      );
    } else {
      renderedMultiDayEvents = null;
    }

    if (!isEmpty(notMultiDayEvents)) {
      renderedNotMultiDayEvents = (
        <span>
          {notMultiDayEvents.map((event, index) => {
            return (
              <div key={index} className="calendar-event-container">
                <a
                  key={event._id}
                  href="!#"
                  className="calendar-event bg-primary text-white d-block p-1 mb-1 mx-auto"
                  onClick={this.showModal(event)}
                  onMouseEnter={this.showTooltip}
                  onMouseLeave={this.hideTooltip}
                >
                  {event.startTime ? event.startTime : null} {event.name}
                </a>
                {this.state.showModal &&
                this.state.eventInModal._id === event._id ? (
                  <FormModal
                    key={event._id + index}
                    eventToDisplay={this.state.eventInModal}
                    disabled={true}
                    hideModal={this.hideModal}
                    formType={"READONLY"}
                  />
                ) : null}
              </div>
            );
          })}
        </span>
      );
    } else {
      renderedNotMultiDayEvents = null;
    }

    return (
      <div>
        {renderedMultiDayEvents}
        {renderedNotMultiDayEvents}
        {this.state.showTooltip && <Tooltip />}
      </div>
    );
  }
}

EventInCalendarCell.propTypes = {
  multiDayEvents: PropTypes.array.isRequired,
  notMultiDayEvents: PropTypes.array.isRequired
};

export default EventInCalendarCell;
