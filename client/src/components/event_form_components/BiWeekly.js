import React from "react";
import SelectInputGroup from "../common/SelectInputGroup";
import PropTypes from "prop-types";

const BiWeekly = props => {
  let biWeeklyDay;

  if (props.values[0] === "1st and 3rd" || props.values[0] === "2nd and 4th") {
    biWeeklyDay = (
      <div className="col-sm-6">
        <label htmlFor="biWeeklyDay">Weekday</label>
        <SelectInputGroup
          name="biWeeklyDay"
          options={[
            "Choose One",
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
          ]}
          value={props.values[1]}
          onChange={props.onChange}
          error={props.errors[1]}
          disabled={props.disabled}
        />
      </div>
    );
  } else {
    biWeeklyDay = null;
  }

  return (
    <div className="form-group row">
      <div className="col-sm-6">
        <label htmlFor="biWeeklySchedule">Bi-Weekly Schedule</label>
        <SelectInputGroup
          name="biWeeklySchedule"
          options={["Choose One", "1st and 3rd", "2nd and 4th"]}
          value={props.values[0]}
          onChange={props.onChange}
          error={props.errors[0]}
          disabled={props.disabled}
        />
      </div>
      {biWeeklyDay}
    </div>
  );
};

BiWeekly.propTypes = {
  values: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.array,
  disabled: PropTypes.bool.isRequired
};

export default BiWeekly;
