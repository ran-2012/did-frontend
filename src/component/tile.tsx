import './styles.css'
import React, {Component} from "react";

interface TileParam {
    x: number;
    y: number;
    hasMine: boolean
    mineCount: number

    onClick(): void;

    explore(): void;

    explode(): void;
}

interface TileState {
    display: State;
}

enum State {
    Idle,
    Empty,
    Flag,
    Unknown,
    Mine,
    Boom
}

class Tile extends Component<TileParam, TileState> {
    state: TileState = {
        display: 0,
    };

    private setMineState(state: State) {
        this.setState(() => ({
            display: state
        }))
    }

    getContent() {
        switch (this.state.display) {
            case State.Empty:
                if (this.props.mineCount > 0) {
                    return this.props.mineCount;
                } else {
                    return '  '
                }
            case State.Idle:
                return '  '
            case State.Flag:
                return '🚩';
            case State.Unknown:
                return '❔';
            case State.Mine:
                return '💣';
            case State.Boom:
                return '🎇'
        }
    }

    getBgColor() {
        switch (this.state.display) {
            case State.Idle:
                return '#f1a51a'
            case State.Empty:
                return '#e0d9bd'
            case State.Flag:
                return '#eec685';
            case State.Unknown:
                return '#d0cfcf';
            case State.Mine:
                return '#5b5b5b';
            case State.Boom:
                return '#ad4444'
        }
    }

    leftClick() {
        this.props.onClick();
        if (this.state.display == State.Idle) {
            console.log(`click x: ${this.props.x}, y: ${this.props.y}`)
            console.log(`mineCount: ${this.props.mineCount}`)
            if (this.hasMine()) {
                this.setMineState(State.Boom)
                this.props.explode();
            } else {
                this.setMineState(State.Empty)
                if (this.props.mineCount == 0) {
                    console.log("start explore")
                    this.props.explore();
                }
            }
        }
    }

    rightClick(e: React.MouseEvent<HTMLDivElement>) {
        if (this.state.display == State.Idle) {
            this.setMineState(State.Flag)
        } else if (this.state.display == State.Flag) {
            this.setMineState(State.Unknown)
        } else if (this.state.display == State.Unknown) {
            this.setMineState(State.Idle)
        }
        e.preventDefault()
    }

    render() {
        return (
            <div className="tile"
                 style={{backgroundColor: this.getBgColor()}}
                 onClick={() => this.leftClick()}
                 onContextMenu={e => this.rightClick(e)}>
                <div className="tile-text">
                    {this.getContent()}
                </div>
            </div>
        )
    }

    hasMine() {
        return this.props.hasMine;
    }

    reset() {
        console.log('reset')
        this.setMineState(State.Idle);
    }
}

export default Tile;