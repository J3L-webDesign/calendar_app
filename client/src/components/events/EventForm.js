import React, { Component } from "react";
import InputGroup from "../common/InputGroup";
import CheckboxInput from "../common/CheckboxInput";

import FormHeader from "../event_form_components/FormHeader";
import NameDescriptionAndLocation from "../event_form_components/NameDescriptionAndLocation";
import FrequencyOptionsField from "../event_form_components/FrequencyOptionsField";
import FrequencyValueFields from "../event_form_components/FrequencyValueFields";
import StartAndEndTime from "../event_form_components/StartAndEndTime";
import FormActionButton from "../event_form_components/FormActionButton";
import DeleteEventButton from "../event_form_components/DeleteEventButton";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  addEvent,
  deleteEvent,
  stageAttendee,
  unstageAttendee,
  removeAttendee,
  clearErrors
} from "../../actions/eventActions";
import { withRouter } from "react-router-dom";
import autoLogOutIfNeeded from "../../validation/autoLogOut";
import isEmpty from "../../validation/is-empty";

class EventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formType: props.formType,
      disabled: props.disabled,
      eventID: props.eventToDisplay._id || null,
      name: props.eventToDisplay.name || "",
      createdBy: props.eventToDisplay.createdBy || "",
      startDate: props.eventToDisplay.startDate || "",
      endDate: props.eventToDisplay.endDate || "",
      allDay: props.eventToDisplay.startTime ? false : true,
      startTime: props.eventToDisplay.startTime || "",
      endTime: props.eventToDisplay.endTime || "",
      description: props.eventToDisplay.description || "",
      frequency: props.eventToDisplay.frequency || "",
      location: props.eventToDisplay.location || "",
      shared: props.eventToDisplay.shared || false,
      attendeeSearchField: "",
      errors: {},
      weeklyDay: props.eventToDisplay.weeklyDay || "",
      biWeeklySchedule: props.eventToDisplay.biWeeklySchedule || "",
      biWeeklyDay: props.eventToDisplay.biWeeklyDay || "",
      monthlyType: props.eventToDisplay.monthlyType || "",
      monthlyDate: props.eventToDisplay.monthlyDate || "",
      monthlySchedule: props.eventToDisplay.monthlySchedule || "",
      monthlyDay: props.eventToDisplay.monthlyDay || ""
    };
  }

  componentDidMount() {
    autoLogOutIfNeeded();
    this.props.clearErrors();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.frequency !== this.state.frequency) {
      return this.setState({
        startDate: "",
        endDate: "",
        weeklyDay: "",
        biWeeklySchedule: "",
        biWeeklyDay: "",
        monthlyType: "",
        monthlyDate: "",
        monthlySchedule: "",
        monthlyDay: ""
      });
    }

    if (prevState.monthlyType !== this.state.monthlyType) {
      return this.setState({
        monthlyDate: "",
        monthlySchedule: "",
        monthlyDay: ""
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.errors !== prevState.errors) {
      return {
        errors: nextProps.errors
      };
    }
    return null;
  }

  toggleAllDay = () => {
    this.setState({ allDay: !this.state.allDay });
  };

  toggleShared = () => {
    this.setState({ shared: !this.state.shared });
  };

  onAddAttendeeClick = e => {
    e.target.blur();
    e.preventDefault();
    this.props.stageAttendee(this.state.attendeeSearchField);
    this.setState({ attendeeSearchField: "" });
  };

  onDeleteAttendeeClick(attendee, e) {
    e.target.blur();
    e.preventDefault();
    this.props.unstageAttendee(attendee);
  }

  onSubmit = e => {
    e.preventDefault();

    const { addEvent, history, auth, event } = this.props;

    const attendees = event.stagedAttendees.join(",");

    const eventData = {
      name: this.state.name,
      eventID: this.state.eventID,
      actionType: this.state.formType,
      createdBy: auth.user.userName,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      description: this.state.description,
      frequency: this.state.frequency,
      location: this.state.location,
      attendees,
      shared: this.state.shared.toString(),
      weeklyDay: this.state.weeklyDay,
      biWeeklySchedule: this.state.biWeeklySchedule,
      biWeeklyDay: this.state.biWeeklyDay,
      monthlyType: this.state.monthlyType,
      monthlyDate: this.state.monthlyDate,
      monthlySchedule: this.state.monthlySchedule,
      monthlyDay: this.state.monthlyDay,
      unsavedAttendee: this.state.attendeeSearchField
    };

    addEvent(eventData, history, this.props.hideModal);
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  setFormToEditState = e => {
    e.preventDefault();
    this.setState({
      disabled: false,
      formType: "EDIT"
    });
  };

  userOwnsEvent = () => {
    if (this.state.eventID) {
      return (
        this.props.eventToDisplay.createdBy.userName ===
        this.props.auth.user.userName
      );
    }
  };

  removeUserFromEvent = () => {
    this.props.removeAttendee(
      this.state.eventID,
      this.props.auth.user.userName,
      this.props.history
    );
  };

  deleteEvent = () => {
    this.props.deleteEvent(this.state.eventID, this.props.history);
  };

  render() {
    const { stagedAttendees, attendeeLoading } = this.props.event;
    const { errors } = this.state;

    let addAttendeeButton;

    if (attendeeLoading) {
      addAttendeeButton = (
        <a
          href="!#"
          onClick={e => e.preventDefault()}
          className="btn btn-primary ml-1"
        >
          <i className="fas fa-circle-notch fa-spin" />
        </a>
      );
    } else {
      addAttendeeButton = (
        <a
          href="!#"
          onClick={this.onAddAttendeeClick}
          className="btn btn-primary ml-1"
        >
          <i className="fas fa-plus" />
        </a>
      );
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-10 col-lg-8 mx-auto">
            <div className="card control-overflow">
              <FormHeader
                errors={errors}
                hideModal={this.props.hideModal}
                formType={this.state.formType}
              />
              <div className="card-body">
                <form onSubmit={this.onSubmit}>
                  <NameDescriptionAndLocation
                    values={[
                      this.state.name,
                      this.state.description,
                      this.state.location
                    ]}
                    disabled={this.state.disabled}
                    errors={[errors.name, errors.description, errors.location]}
                    onChange={this.onChange}
                  />

                  <FrequencyOptionsField
                    onChange={this.onChange}
                    disabled={this.state.disabled}
                    errors={errors}
                    frequency={this.state.frequency}
                  />

                  <FrequencyValueFields
                    props={this.state}
                    onChange={this.onChange}
                  />

                  <CheckboxInput
                    name="allDay"
                    value={this.state.allDay}
                    onChange={this.toggleAllDay}
                    checked={this.state.allDay}
                    disabled={this.state.disabled}
                    label="All Day Event"
                  />

                  {!this.state.allDay && (
                    <StartAndEndTime
                      values={[this.state.startTime, this.state.endTime]}
                      error={errors.startTime}
                      onChange={this.onChange}
                      disabled={this.state.disabled}
                    />
                  )}

                  <CheckboxInput
                    name="shared"
                    value={this.state.shared}
                    onChange={this.toggleShared}
                    checked={this.state.shared}
                    disabled={this.state.disabled}
                    label="Share This Event"
                  />

                  {this.state.shared && isEmpty(this.props.eventToDisplay) && (
                    <div className="row">
                      {stagedAttendees.map(attendee => (
                        <div
                          key={attendee}
                          className="col-sm-6 d-flex align-items-start pt-3"
                        >
                          <InputGroup
                            value={attendee}
                            disabled={true}
                            name={attendee}
                          />
                          <a
                            href="!#"
                            onClick={this.onDeleteAttendeeClick.bind(
                              this,
                              attendee
                            )}
                            value={attendee}
                            className="btn btn-danger ml-1"
                          >
                            <i className="fas fa-ban" />
                          </a>
                        </div>
                      ))}
                      <div className="col-sm-6 d-flex align-items-start pt-3">
                        <InputGroup
                          placeholder="Attendee"
                          name="attendeeSearchField"
                          value={this.state.attendeeSearchField}
                          onChange={this.onChange}
                          error={errors.attendees}
                          disabled={this.state.disabled}
                        />
                        {addAttendeeButton}
                      </div>
                    </div>
                  )}

                  {!isEmpty(this.props.eventToDisplay) &&
                    this.props.eventToDisplay.attendees.length > 1 && (
                      <div className="row">
                        {this.props.eventToDisplay.attendees.map(attendee => (
                          <div
                            key={attendee.id}
                            className="col-sm-6 d-flex align-items-start pt-3"
                          >
                            <InputGroup
                              value={attendee.userName}
                              disabled={true}
                              name={attendee.userName}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="form-group my-5">
                    <FormActionButton
                      formType={this.state.formType}
                      userOwnsEvent={this.userOwnsEvent()}
                      setEditState={this.setFormToEditState}
                      removeUser={this.removeUserFromEvent}
                    />
                    <DeleteEventButton
                      formType={this.state.formType}
                      userOwnsEvent={this.userOwnsEvent()}
                      onClick={this.deleteEvent}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EventForm.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  addEvent: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired,
  stageAttendee: PropTypes.func.isRequired,
  unstageAttendee: PropTypes.func.isRequired,
  removeAttendee: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  event: state.event,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  {
    addEvent,
    deleteEvent,
    stageAttendee,
    unstageAttendee,
    removeAttendee,
    clearErrors
  }
)(withRouter(EventForm));
