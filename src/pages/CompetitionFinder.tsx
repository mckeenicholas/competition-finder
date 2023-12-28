import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Input,
  Select,
  Sheet,
  Slider,
  Switch,
  ThemeProvider,
  ToggleButtonGroup,
  Option,
} from "@mui/joy";
import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState, useMemo } from "react";
import { LocationOn } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { Nullable, coordinate, eventID } from "../utils/types";
import { EventIcon } from "../components/EventIcon";
import { events, eventIDtoName } from "../utils/events";
import CompetitionList from "../components/CompetitionList";

export const CompetitionFinder = () => {
  const [location, setLocation] = useState<Nullable<coordinate>>(null);
  const [textBoxContents, setTextBoxContents] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(1);
  const [displayDistance, setDisplayDistance] = useState<number>(5);
  const [isMiles, setIsMiles] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<eventID[]>([]);
  const [competitions, setCompetitions] = useState<any>([]);

  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const theme = useTheme();

  const distancesKm = [
    0, 5, 10, 15, 20, 25, 35, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500,
    750, 1000, 1500, 2000, 2500, 5000, 10000, 20000,
  ];
  const distancesMi = [
    0, 3, 5, 10, 15, 20, 25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500,
    750, 1000, 1500, 2000, 2500, 3000, 6000, 12000,
  ];

  const apiCall = async (url: string) => {
    setIsLoading(true); 
    const result = await fetch(url);
    setIsLoading(false);
    return result.json();
  };

  const getCompetitions = async () => {
    setIsLoading(true);
    const response = (
      await apiCall(
        "https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions.json",
      )
    ).items.reverse();
    // The WCA's list can sometimes be cached, so remove past compeitions
    const comps = response.filter((competition: any) => {
      const endDate = new Date(competition.date.till + "T23:59:59.999Z");
      return endDate > new Date();
    });
    setIsLoading(false);
    return comps;
  };

  // Hook to update the competitions displayed on the site
  useEffect(() => {
    const getCompetitionList = async () => {
      setCompetitions(await getCompetitions());
      setIsLoading(false);
    };
    getCompetitionList();
  }, []);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setTextBoxContents(
            await getLocationName(
              position.coords.latitude,
              position.coords.longitude,
            ),
          );
        },
        (error) => {
          alert("Unable to get current location.");
        },
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  //TODO: Implement usememo on api calls
  const handleSearch = async () => {
    const data = await apiCall(
      `https://nominatim.openstreetmap.org/search?addressdetails=1&format=jsonv2&q=${textBoxContents}`,
    );

    //TODO: handle cities with duplicate names
    const city = data[0];

    setTextBoxContents(
      city.address.city
        ? `${city.address.city}, ${city.address.state}`
        : city.display_name,
    );
    setLocation({ lat: city.lat, lon: city.lon });
  };

  //TODO: correctly set location state name here
  const getLocationName = async (lat: number, lon: number) => {
    const data = await apiCall(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&addressdetails=1&format=jsonv2`,
    );
    return (
      data.address.city
        ? `${data.address.city}, ${data.address.state}`
        : data.display_name
    );
  };

  const handleChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setSliderValue(newValue);
      setDisplayDistance(calculateValue(newValue)!);
    }
  };

  const valueLabelFormat = (value: any) => {
    return String(value) + (isMiles ? " mi" : " km");
  };

  const calculateValue = (value: number) => {
    const distances = isMiles ? distancesMi : distancesKm;
    return distances.at(value) ?? 0;
  };

  const updateDistance = (newValue: number, isMiles: boolean) => {
    setDisplayDistance(newValue as unknown as number);

    const distnaces = isMiles ? distancesMi : distancesKm;
    let closestIndex = distnaces[0];
    let diff = Math.abs(closestIndex - newValue);
    for (let i = 0; i < distnaces.length; i++) {
      if (Math.abs(distnaces[i] - newValue) < diff) {
        diff = Math.abs(distnaces[i] - newValue);
        closestIndex = i;
      }
    }
    setSliderValue(closestIndex);
  };

  const updateUnit = (isMiles: boolean) => {
    setIsMiles(isMiles);
    updateDistance(
      Math.round(isMiles ? displayDistance * 0.625 : displayDistance / 0.625),
      isMiles,
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" style={{ textAlign: "center" }}>
        <Box marginTop="2rem" marginX={isSmall ? "1rem" : "4rem"}>
          <Typography
            component="h1"
            variant="h3"
            fontWeight="bold"
            gutterBottom
          >
            WCA Competition Finder
          </Typography>
          <Grid
            container
            spacing={2}
            sx={{ flexGrow: 1 }}
            alignContent="center"
          >
            <Grid xs={12} md={12}>
              <Input
                placeholder="Enter Location"
                size="lg"
                startDecorator={
                  <Box display="flex" alignItems="center">
                    <Button
                      variant="soft"
                      color="neutral"
                      startDecorator={<LocationOn />}
                      onClick={getUserLocation}
                    >
                      {isSmall ? "" : "Use my current location"}
                    </Button>
                  </Box>
                }
                endDecorator={
                  <Box display="flex" alignItems="center">
                    <Button
                      startDecorator={<SearchIcon />}
                      onClick={handleSearch}
                    >
                      {isSmall ? "" : "Search"}
                    </Button>
                  </Box>
                }
                value={textBoxContents}
                onChange={(event) => setTextBoxContents(event.target.value)}
              />
            </Grid>
            <Grid
              xs={12}
              md={8}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Typography marginX="1rem">Show competitions within:</Typography>
              <Slider
                value={sliderValue}
                min={1}
                step={1}
                max={24}
                scale={calculateValue}
                getAriaValueText={valueLabelFormat}
                valueLabelFormat={valueLabelFormat}
                onChange={handleChange}
                valueLabelDisplay="auto"
                aria-labelledby="non-linear-slider"
              />
            </Grid>
            <Grid xs={6} md={2}>
              <Input
                size="lg"
                value={displayDistance}
                onChange={(event) =>
                  updateDistance(Number(event.target.value), isMiles)
                }
                endDecorator={<Typography>{isMiles ? "mi" : "km"}</Typography>}
              />
            </Grid>
            <Grid
              container
              xs={6}
              md={2}
              justifyContent="center"
              alignItems="center"
            >
              <Typography margin="1rem">km</Typography>
              <Switch
                checked={isMiles}
                onChange={(event) => updateUnit(event.target.checked)}
              />
              <Typography margin="1rem">mi</Typography>
            </Grid>
            <Grid xs={12} md={12}>
              <AccordionGroup
                color="neutral"
                variant="outlined"
                sx={{ borderRadius: "sm" }}
              >
                <Accordion>
                  <AccordionSummary>Additional Filters</AccordionSummary>
                  <AccordionDetails>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: isSmall ? "column" : "row",
                      }}
                    >
                      {isSmall ? (
                        <Select
                          multiple
                          placeholder="Events"
                          value={selectedEvents}
                          onChange={(_event, newEvent: Array<eventID>) =>
                            setSelectedEvents(newEvent)
                          }
                          renderValue={() => (
                            <Box
                              sx={{
                                display: "flex",
                                gap: "0.25rem",
                                flexWrap: "wrap",
                              }}
                            >
                              {selectedEvents.map((selectedOption) => (
                                <Chip variant="soft" color="primary">
                                  {eventIDtoName(selectedOption)}
                                </Chip>
                              ))}
                            </Box>
                          )}
                          sx={{
                            minWidth: "15rem",
                          }}
                          slotProps={{
                            listbox: {
                              sx: {
                                width: "100%",
                              },
                            },
                          }}
                        >
                          {events.map((wca_event) => (
                            <Option value={wca_event}>
                              {" "}
                              <EventIcon event={wca_event} />
                              {eventIDtoName(wca_event)}{" "}
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <>
                          <Sheet
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              display: "flex",
                              p: 0.5,
                              marginX: 0.5,
                            }}
                          >
                            <ToggleButtonGroup
                              variant="plain"
                              spacing={0.5}
                              aria-label="event-select"
                              value={selectedEvents}
                              onChange={(_event, newEvent) => {
                                setSelectedEvents(newEvent);
                              }}
                            >
                              {events.map((wca_event) => (
                                <Button key={wca_event} value={wca_event}>
                                  <EventIcon event={wca_event} />
                                </Button>
                              ))}
                            </ToggleButtonGroup>
                          </Sheet>
                        </>
                      )}
                      <Box>
                        <Button
                          sx={{ marginX: 0.5, marginY: 2, minHeight: "54px" }}
                          onClick={() => setSelectedEvents(events)}
                        >
                          All
                        </Button>
                        <Button
                          color="neutral"
                          variant="outlined"
                          sx={{ marginX: 0.5, marginY: 2, minHeight: "54px" }}
                          onClick={() => setSelectedEvents([])}
                        >
                          Clear
                        </Button>
                      </Box>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </AccordionGroup>
            </Grid>
          </Grid>
        </Box>
        {isLoading ? (
          <Box margin="4rem">
            <CircularProgress />
          </Box>
        ) : (
          <CompetitionList
            competitions={competitions}
            location={location}
            distance={displayDistance}
            isMiles={isMiles}
            events={selectedEvents}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};
