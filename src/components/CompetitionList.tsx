import { useEffect, useMemo, useRef, useState } from "react";
import { Nullable, coordinate, eventID } from "../utils/types";
import React from "react";
import { Box, Button, Card } from "@mui/joy";
import { Typography } from "@mui/material";

interface CompetitionListProps {
  competitions: Array<any>;
  location: Nullable<coordinate>;
  distance: number;
  isMiles: boolean;
  events: Array<eventID>;
}

const CompetitionList: React.FC<CompetitionListProps> = ({
  competitions,
  location,
  distance,
  isMiles,
  events,
}) => {
  const [numDisplayed, setNumDisplayed] = useState<number>(48);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (
        containerRef.current &&
        window.innerHeight + window.scrollY >= containerRef.current.offsetHeight
      ) {
        // User has scrolled to the bottom
        setNumDisplayed((prevNumDisplayed) => prevNumDisplayed + 48);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const distanceKm = isMiles ? distance * 1.6 : distance;

  // Find the distance in km between two sets of coordinates using Haversine formula
  const findDistance = (location: coordinate, other: coordinate) => {
    const earthRadius = 6371;

    const radLat1 = (Math.PI / 180) * location.lat;
    const radLon1 = (Math.PI / 180) * location.lon;
    const radLat2 = (Math.PI / 180) * other.lat;
    const radLon2 = (Math.PI / 180) * other.lon;

    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  const filterDistance = (
    competitions: Array<any>,
    location: Nullable<coordinate>,
    distance: number,
  ) => {
    setNumDisplayed(48);

    // Use 19200 due to inexact miles to km conversion
    if (distance === 0 || distance >= 19200 || location === null) {
      return competitions;
    }

    return competitions.filter((competition: any) => {
      return (
        findDistance(location, {
          lat: competition.venue.coordinates.latitude,
          lon: competition.venue.coordinates.longitude,
        }) <= distance
      );
    });
  };

  const filterEvents = (competitions: Array<any>, events: Array<eventID>) => {
    setNumDisplayed(48);
    if (events.length === 0) {
      return competitions;
    }

    return competitions.filter((competition: any) => {
      return competition.events.some((event: eventID) =>
        events.includes(event),
      );
    });
  };

  const distanceFiltered = useMemo(
    () => filterDistance(competitions, location, distanceKm),
    [competitions, location, distanceKm],
  );

  const filteredEvents = useMemo(
    () => filterEvents(distanceFiltered, events),
    [distanceFiltered, events],
  );

  const displayedEvents = filteredEvents.slice(0, numDisplayed);

  return (
    <div ref={containerRef}>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        alignItems="center"
      >
        {displayedEvents.map((competition) => (
          <Box margin={0.5} padding={0.5}>
            <Card>
              <Typography variant="h5" fontWeight="bold">
                {competition.name}
              </Typography>
              <Typography gutterBottom maxWidth="400px">
                {new Date(
                  competition.date.from + "T12:00:00.000Z",
                ).toLocaleString("en-US", { month: "long", day: "numeric" })}
                {" | "}
                {competition.city}
              </Typography>
              <Button
                component="a"
                href={`https://worldcubeassociation.org/competitions/${competition.id}`}
                variant="soft"
                color="neutral"
              >
                View Competition
              </Button>
            </Card>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default CompetitionList;
