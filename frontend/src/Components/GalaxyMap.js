import { Component } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import { Keys } from '../const.js';
import { PlanetReader } from '../Models/models.js';

class GalaxyStates {

    static Initial = "initial";
    static Loading = "loading";
    static Loaded = "loaded";
    static Error = "error";
}


export class GalaxyMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            action: GalaxyStates.Initial,
            data: [],
            error: null,
            limit: 0,
        };
    }

    componentDidMount() {
        this.setState({
            action: GalaxyStates.Loading,
        });

        fetch('https://kejith.de/galaxy/planets?galaxy=1')
            .then(response => response.json())
            .then(data => {
                var planets = PlanetReader.fromData(data)
                this.setState({
                    action: GalaxyStates.Loaded,
                    data: planets,
                });
            })
            .catch(error => {
                this.setState({
                    error: error,
                    action: GalaxyStates.Error,
                });
            })
    }

    chunkData() {
        const { data } = this.state
        var keys = Object.keys(data)

        // group data by systems
        var systems = {}
        var lastSystemId = 0
        var chunks = []
        var chunk = {}
        keys.forEach(key => {
            var systemId = data[key].coords.system

            // chunk systems into hundreds
            if (lastSystemId % 500 === 0) {
                chunks.push(chunk)
                chunk = {}
            }

            // system does not exists yet 
            // save latest system and start a new one
            if (systems[systemId] === undefined) {
                systems[systemId] = []

                // add finished system to chunk
                if (lastSystemId !== 0) {
                    chunk[lastSystemId] = systems[lastSystemId]
                }
            }

            lastSystemId = systemId
            // add planet to system
            systems[systemId].push(data[key])
        })

        chunks.push(chunk)


        return chunks
    }



    onClick(limits) {
        
        this.setState({
            limit: limits.fleet
        });
    }

    render() {
        const { error } = this.state

        if (this.state.action === GalaxyStates.Error)
            console.error(error)



        if (this.state.action === GalaxyStates.Loaded) {
            var chunks = this.chunkData()

            return (
                <div key="galaxy-map" className='galaxy-map'>

                    <Header
                        action={this.state.action}
                        limit={this.state.limit}
                        onClick={this.onClick.bind(this)}

                    />

                    {chunks.map((chunk, index) => {
                        return (
                            <div className='systems-chunk' key={"chunk-" + index}>
                                <div className='systems  '>
                                    {Object.keys(chunk).map(system => {
                                        return (
                                            <System
                                                key={`system-${system}`}
                                                system={system}
                                                planets={chunk[system]}
                                                limit={this.state.limit}
                                            />
                                        )
                                    })}
                                </div>

                            </div>
                        )
                    })}

                </div>
            );
        } else {
            return (<div></div>)
        }
    }

}

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            limits: {
                fleet: 1000,
                defense: 1000,
                structures: 1000,
            },
        };
    }

    // onChange sets the state and reads the value of limit from the event
    onChange(event) {
        if (event !== undefined && event.target) {
            var limits = {}

            // check which limit should be set
            Object.keys(this.state.limits).forEach(key => {
                if (event.target.name === `limit-${key}`) {
                    limits[key] = event.target.value
                }
            })

            this.setState({
                limits: {...this.state.limits, ...limits}
            });
        }
    }

    onClick() {
        this.props.onClick(this.state.limits)
    }

    render() {
        var ranges = Object.keys(this.state.limits).map(key => {
            var name = `limit-` + key
            return (
                <div className='range-slider' key={key}>
                    <RangeSlider
                        min={0}
                        max={100000}
                        step={1000}
                        value={this.state.limits[key]}
                        onChange={this.onChange.bind(this)}
                        orientation="horizontal"
                        tooltip="hide"
                        id={key}
                        name={name}
                    />
                    <output htmlFor={name}>{this.state.limits[key]}</output>
                </div>
            )
        })
        return (
            <div className="header">
                <h1>{this.props.action}</h1>

                <div className="container">
                    <div className="row">
                        <div className="col-xs-6">
                            {ranges}
                        </div>
                    </div>
                </div>
                <Button
                    variant="primary"
                    className={""}
                    onClick={this.onClick.bind(this)}
                >
                    Filtern
                </Button>
            </div>
        );
    }
}

// System renders a list of planets
class System extends Component {
    planetKey(planet) {
        const { galaxy: g, system: s, position: p } = planet.coords
        return g + "-" + s + "-" + p
    }

    render() {
        const { system, planets, limit } = this.props


        return (
            <div key={system} className="galaxy-map-system" style={{ minWidth: 55 }}>
                <div className="galaxy-map-system-planets row">
                    <div className="galaxy-map-system-name col-1">{system}</div>
                    <div className="planet-list  col d-flex flex-row">
                            {planets.map(planet => {
                                var key = this.planetKey(planet)
                                return <PlanetTile limit={limit} key={key} planet={planet} />
                            })}
                        </div>
                    </div>
            </div>
        );
    }
}

class PlanetSummary extends Component {
    render() {
        const { planet } = this.props

        return (
            <div className="galaxy-map-planet-summary">
                <CategoryTable
                    payload={{
                        data: planet.data.ressources,
                        category: "ressources"
                    }}
                />

                <CategoryTable
                    payload={planet.getFleet()}
                />

                <CategoryTable
                    payload={planet.getDefense()}
                />

                <CategoryTable
                    payload={planet.getStructures()}
                />

            </div>
        )
    }
}

class PlanetTile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showPopover: false,
            values: {
                fleet: this.props.planet.getFleet().value(),
                defense: this.props.planet.getFleet().value(),
                buildings: this.props.planet.getFleet().value(),
            },
            dangerLimit: this.props.limit
        };
    }

    popoverButton() {
        const { planet } = this.props
        return (
            <OverlayTrigger
                placement="right"
                trigger={["hover", "focus"]}//["hover", "focus"]}
                overlay={(
                    this.popover(planet)
                )}
            >
                <Button
                    style={{ minWidth: 40 }}
                    className={
                        "planet-tile " +
                        "danger-" + this.calculateDangerLevel()
                    }
                >
                    {planet.coords.position}
                </Button>
            </OverlayTrigger>
        )
    }

    popover(planet) {
        return (
            <Popover id="popover-contained" title="Popover bottom">
                <Popover.Header as="h3">
                    {planet.name} - {planet.user.name}
                </Popover.Header>
                <Popover.Body>
                    <PlanetSummary planet={planet} />
                </Popover.Body>
            </Popover>
        )
    }

    calculateDangerLevel() {
        const { values } = this.state
        const { limit } = this.props
        var danger = 0
        danger = values.fleet / (limit * 1000)

        var isMaybeNotScanned = (values.fleet + values.defense + values.buildings) <= 0
        if (isMaybeNotScanned)
            return -1

        if (isNaN(danger) || danger === Infinity) {
            return 0
        }


        var dangerLevel = 1
        var levelMaxLimits = [0.25, 0.75, 1, 1.25, 1.75]
        levelMaxLimits.forEach((limit, index) => {
            if (danger > limit) {
                dangerLevel = index + 1
            }
        })

        return dangerLevel
    }

    render() {
        return (
            <div className="galaxy-map-planet">
                {this.popoverButton()}
            </div>
        );
    }
}

class CategoryTable extends Component {
    render() {
        const { payload } = this.props
        const { category, data } = payload

        const elements = Object.keys(data).map(element => {
            return (
                <CategoryTableElement
                    key={element}
                    element={element}
                    data={data}
                    category={category}
                />
            )
        })

        return (
            <div>
                <div>
                    <span>{Keys[category].de.name}</span>
                </div>
                <div style={{ minWidth: 150 }}>
                    <div className="d-flex flex-wrap" >
                        {elements}
                    </div>
                </div>
            </div>
        )

    }
}

class CategoryTableElement extends Component {
    render() {
        const { category, element, data } = this.props
        if (data === undefined) return

        return (
            <div className="cell colony-data">
                <span className="element element-name">{Keys[category][element].de.abbr}</span><br />
                <span className="element element-level">{data[element].toLocaleString()}</span>
            </div>
        )
    }
}