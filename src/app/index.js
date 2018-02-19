import React from "react";
import {render} from "react-dom";
import {Route, Router} from "react-router";
import {history} from "./components/History";

import {Root} from "./components/Root";

class App extends React.Component {
    render() {
        return (
            <Router history={history}>
                <Route path={"/"} component={Root}/>
            </Router>
        );
    }
}

render(<App/>, window.document.getElementById('app'));