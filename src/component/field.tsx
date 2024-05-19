import Tile from "./tile.tsx";
import React, {Component, createRef} from "react";
import './styles.css'

class FieldParam {
    x: number = 10;
    y: number = 10;
    mineCount: number = 10;
}

interface FieldState {
    resetId: number
    mineMap: boolean[][]
}

function shuffle(a: number[]): number[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randomPerm(count: number, max: number): number[] {
    const array: number[] = [];
    for (let i = 0; i < max; ++i) {
        array.push(i);
    }
    return shuffle(array).slice(0, count);
}

class Field extends Component<FieldParam, FieldState> {
    state: FieldState = {
        resetId: 0,
        mineMap: this.emptyMineMap()
    };

    tiles: React.RefObject<Tile>[][] = [];
    tile0 = createRef<Tile>()

    constructor(props: FieldParam) {
        super(props);

        this.initTileRef();
    }

    componentDidMount() {
        this.initMine();
    }

    emptyMineMap() {
        const mineMap: boolean[][] = []
        for (let i = 0; i < this.props.y; ++i) {
            mineMap.push([])
            for (let j = 0; j < this.props.x; ++j) {
                mineMap[i].push(false);
            }
        }
        return mineMap
    }

    reset() {
        for (let i = 0; i < this.props.y; ++i) {
            for (let j = 0; j < this.props.x; ++j) {
                this.tiles[j][i].current?.reset();
            }
        }
        this.initMine()
    }

    initTileRef() {
        for (let i = 0; i < this.props.y; ++i) {
            this.tiles.push([])
            for (let j = 0; j < this.props.x; ++j) {
                this.tiles[i].push(createRef());
            }
        }
    }

    initMine() {
        const mineMap = this.emptyMineMap()
        randomPerm(this.props.mineCount, this.props.x * this.props.y).forEach((value) => {
            const x = value % this.props.y;
            const y = Math.floor(value / this.props.x);
            mineMap[x][y] = true;
            console.log(`mine at ${x}, ${y}`);
        })
        this.setState(() => ({
            mineMap: mineMap
        }))
    }

    isValid(x: number, y: number) {
        return x >= 0 && x < this.props.x && y >= 0 && y < this.props.y;
    }

    getTile(x: number, y: number) {
        if (x >= this.props.x || y >= this.props.y) {
            throw new Error("Invalid index")
        }
        return this.tiles[y][x].current;
    }

    isSetMine(x: number, y: number) {
        return this.state.mineMap[x][y]
    }

    getMineCount(x: number, y: number) {
        let count = 0;
        const r = [-1, 0, 1];
        for (const i of r) {
            for (const j of r) {
                if (i === 0 && j === 0) {
                    continue;
                }
                const _x = x + i;
                const _y = y + j;
                if (!this.isValid(_x, _y)) {
                    continue;
                }
                if (this.state.mineMap[_x][_y]) {
                    ++count;
                }
            }
        }
        return count;
    }

    explore(x: number, y: number) {
        const ex = (x: number, y: number) => {
            if (this.isValid(x, y)) {
                this.tiles[x][y].current?.leftClick();
            }
        }

        setTimeout(() => {
            const r = [-1, 0, 1];
            for (const i of r) {
                for (const j of r) {
                    if (i === 0 && j === 0) {
                        continue;
                    }
                    const _x = x + i;
                    const _y = y + j;

                    ex(_x, _y);
                }
            }
        }, 2)
    }

    renderLine(x: number) {
        return this.tiles[x].map((tile, y) =>
            <Tile key={x + '-' + y} ref={tile} x={x} y={y} hasMine={this.isSetMine(x, y)}
                  mineCount={this.getMineCount(x, y)}
                  onClick={() => {
                  }} explore={() => {
                this.explore(x, y)
            }} explode={() => {
                console.log("explosion")
            }}/>
        )
    }

    renderField() {
        return this.tiles.map((_, x) => {
            return (<div key={'c' + x} style={{display: "flex"}}>{this.renderLine(x)} </div>)
        })
    }

    render() {
        console.log("render")
        return (
            <div className='field'>
                <button onClick={() => this.reset()} style={{marginBottom: '1em'}}>Reset</button>
                <div>
                    <div style={{display: "inline-block"}}>
                        {this.renderField()}
                    </div>
                </div>
            </div>
        )
    }
}

export default Field