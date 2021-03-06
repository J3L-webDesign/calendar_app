const validateCreateEventInput = require("../../validation/createEvent"),
  express = require("express"),
  router = express.Router(),
  Event = require("../../models/Event"),
  User = require("../../models/Users"),
  passport = require("passport"),
  utils = require("../../utils"),
  { getEventAttendees, removeAttendeeFromEvent } = utils.eventUtilities,
  isEmpty = require("../../validation/is-empty");

// @route    POST /api/event
// @desc     create a new event
// @access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateCreateEventInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    if (req.body.unsavedAttendee) {
      errors.attendees = "Please save this attendee";
      return res.status(400).json(errors);
    }

    try {
      const eventData = {};
      eventData.name = req.body.name;
      eventData.shared = req.body.shared;
      eventData.frequency = req.body.frequency;
      if (req.body.startDate) eventData.startDate = req.body.startDate;
      if (req.body.endDate) eventData.endDate = req.body.endDate;

      if (!req.body.allDay) {
        req.body.startTime
          ? (eventData.startTime = req.body.startTime)
          : (eventData.startTime = null);
        req.body.startTime && req.body.endTime
          ? (eventData.endTime = req.body.endTime)
          : (eventData.endTime = null);
      } else {
        eventData.startTime = null;
        eventData.endTime = null;
      }

      if (req.body.description) eventData.description = req.body.description;
      if (req.body.biWeeklySchedule)
        eventData.biWeeklySchedule = req.body.biWeeklySchedule;
      if (req.body.biWeeklyDay) eventData.biWeeklyDay = req.body.biWeeklyDay;
      if (req.body.weeklyDay) eventData.weeklyDay = req.body.weeklyDay;
      if (req.body.monthlyType) eventData.monthlyType = req.body.monthlyType;
      if (req.body.monthlyDate) eventData.monthlyDate = req.body.monthlyDate;
      if (req.body.monthlySchedule)
        eventData.monthlySchedule = req.body.monthlySchedule;
      if (req.body.monthlyDay) eventData.monthlyDay = req.body.monthlyDay;
      if (req.body.location) eventData.location = req.body.location;

      eventData.createdBy = {
        userName: req.user.userName,
        id: req.user._id
      };

      eventData.attendees = await getEventAttendees(
        eventData.createdBy,
        utils.parseStringToBool(req.body.shared),
        req.body.attendees
      );

      if (req.body.actionType === "EDIT") {
        const confirmedEvent = await Event.find({
          _id: req.body.eventID,
          createdBy: eventData.createdBy
        });

        if (!isEmpty(confirmedEvent)) {
          await Event.findByIdAndUpdate(req.body.eventID, eventData);
          res.json({ msg: "SUCCESS" });
        } else {
          errors.error = "You are not authorized to edit that event";
          res.status(400).json(errors);
        }
      } else {
        const newEvent = await Event.create(eventData);
        res.json({ newEvent });
      }
    } catch (err) {
      errors.error = "Something Went Wrong...";
      res.status(400).json(errors);
    }
  }
);

// @route    GET /api/event/all
// @desc     Get all events associated with current logged in user (both owned and attended)
// @access   Private
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};
    try {
      const currentUser = {
        userName: req.user.userName,
        id: req.user._id
      };

      const usersEvents = await Event.find({ attendees: currentUser });

      res.json(usersEvents);
    } catch (err) {
      errors.error = err.message;
      res.status(404).json(errors);
    }
  }
);

// @route    DELETE /api/event/:id/delete
// @desc     delete an event
// @access   Private
router.delete(
  "/:id/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};
    try {
      const currentUser = {
        userName: req.user.userName,
        id: req.user._id
      };

      const foundEvent = await Event.find({
        createdBy: currentUser,
        _id: req.params.id
      });

      if (isEmpty(foundEvent)) throw new Error();

      await Event.findOneAndRemove({ _id: req.params.id });

      res.status(200).json({ status: "success" });
    } catch (err) {
      errors.error = "Unable to delete specified event";
      res.status(401).json(errors);
    }
  }
);

// @route    GET /api/event/attendee/:userName
// @desc     Verify an attendee exists
// @access   Private
router.get(
  "/attendee/:userName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};
    try {
      const attendee = await User.findOne({
        lower_case_username: req.params.userName.toLowerCase()
      });

      if (isEmpty(attendee)) throw new Error();

      if (attendee.userName === req.user.userName) {
        errors.attendees = "You can not add yourself";
        return res.status(400).json(errors);
      }

      res.status(200).json(attendee.userName);
    } catch (err) {
      errors.attendees = `Attendee ${req.params.userName} was not found`;
      res.status(404).json(errors);
    }
  }
);

// @route    DELETE /api/event/:id/attendee/:userName/delete
// @desc     remove attendee from event
// @access   Private
router.delete(
  "/:id/attendee/:userName/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};
    try {
      const event = await Event.findOne({ _id: req.params.id });

      if (event.createdBy.userName === req.params.userName) {
        errors.invalid = "You cannot remove yourself from an event you created";
        res.status(400).json(errors);
      } else if (
        event.createdBy.userName === req.user.userName ||
        req.user.userName === req.params.userName
      ) {
        const updatedEventData = removeAttendeeFromEvent(
          req.params.userName,
          event
        );

        await Event.findByIdAndUpdate(req.params.id, updatedEventData);

        res.json({ status: "success" });
      } else {
        errors.unauthorized = "You are not authorized to remove that attendee";
        res.status(400).json(errors);
      }
    } catch (err) {
      errors.error = "Unable to remove attendee";
      res.status(400).json(errors);
    }
  }
);

module.exports = router;
