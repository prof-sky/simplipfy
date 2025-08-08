# Matomo usage

## Matomo tracking

This website is using matomo to track user actions. The focus is set on respecting the user privacy which
means some things can not be tracked, for example returning users. However, specific events can still be 
analyzed, helping to see how the users interact with simplipfy. 

## Events

The following events are tracked manually by the frontend:

- Circuit Events (selected circuit, circuit finished/aborted, ...)
- Error Events (failure to load, ...)
- Configuration Events (dark mode, language)

If you want to adopt some of the functionality, you can use the `matomoHelper.js` file in the `src/scripts/utils` directory.
It specifies different actions like: 

```{js}
const circuitActions = {
    Finished: "Fertig",
    Aborted: "Abgebrochen",
    Reset: "Reset",
    ErrCanNotSimpl: "Kann nicht vereinfacht werden",
    ViewVcExplanation: "VC Rechnung angeschaut",
    ViewZExplanation: "Z Rechnung angeschaut",
    ViewTotalExplanation: "Gesamtrechnung angeschaut",
    ViewSolutions: "Lösungen angeschaut",
}
```

The events are currently sent on german, the names themselves don't need to be exactly this, however it is a good idea
to have a consistent naming scheme, meaning you should not change the names because then the analysis is split between 
different names for the same event.

## Usage

### Circuit Event
Use the `pushCircuitEventMatomo(action, value=-1)` function to send a circuit event to Matomo.
Action can be one of the defined `circuitActions`.

### Error Event
Use the `pushErrorEventMatomo(action, error)` function to send an error event to Matomo,
where action is a defined `errorActions` and error is the thrown error or an error string.

### Configuration Event
Use the `pushConfigurationEventMatomo(action, configuration, value=-1)` function to send a configuration event to Matomo,
where action is one of the defined `configActions` and value is the value of the configuration (e.g. language or dark mode).