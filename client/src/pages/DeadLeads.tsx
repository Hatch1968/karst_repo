import React, {Component} from 'react';
import {DeadLeadsTable} from '../components/DeadLeadsTable';
import {getAllLeadPoints} from '../dataservice/leadPoints';
import {LeadPointInterface} from '../interfaces/LeadPointInterface';
import {Helmet} from 'react-helmet';

interface State {
  points: LeadPointInterface[];
}

interface Props {}

class DeadLeads extends Component<Props, State> {
  constructor(Props) {
    super(Props);
    this.state = {
      points: undefined,
    };
  }

  componentDidMount() {
    getAllLeadPoints().then(requstedLeads => {
      this.setState({points: requstedLeads});
    });
  }

  render() {
    return (
      <div className="site-layout-content">
        <Helmet>
          <title>Leads</title>
        </Helmet>
        <DeadLeadsTable points={this.state.points}></DeadLeadsTable>
      </div>
    );
  }
}
export {DeadLeads};
