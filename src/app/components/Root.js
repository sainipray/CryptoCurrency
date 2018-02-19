import React from "react";

import {Chart} from "./Chart"

export class Root extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container-fluid">
                <Chart/>
            </div>
        );
    }
}