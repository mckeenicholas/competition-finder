import React from "react";
import { Tooltip } from "@mui/joy";
import { eventID } from "../utils/types";
import { eventIDtoName } from "../utils/events";
import { Icon, styled } from "@mui/material";
import "../utils/icons.css";

// StyledIcon component to handle styling
const StyledIcon = styled(Icon)(({ theme }) => ({
  height: "36px", // Adjust the height as needed
  width: "24px", // Adjust the width as needed
}));

export const EventIcon: React.FC<{
  event: eventID;
}> = (props) => {
  const { event } = props;

  return (
    <Tooltip title={eventIDtoName(event)} variant="outlined">
      <StyledIcon baseClassName={`icon cubing-icon event-${event}`} />
    </Tooltip>
  );
};
