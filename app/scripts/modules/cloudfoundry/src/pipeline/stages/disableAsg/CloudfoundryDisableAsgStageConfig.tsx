import * as React from 'react';
import {
  AccountService,
  Application,
  IAccount,
  IPipeline,
  IRegion,
  IStageConfigProps,
  NgReact,
  StageConstants,
  StageConfigField,
} from '@spinnaker/core';

import { AccountRegionClusterSelector } from 'cloudfoundry/presentation';

export interface ICloudfoundryDisableAsgStageProps extends IStageConfigProps {
  pipeline: IPipeline;
}

export interface ICloudfoundryDisableAsgStageConfigState {
  accounts: IAccount[];
  application: Application;
  cloudProvider: string;
  credentials: string;
  pipeline: IPipeline;
  region: string;
  regions: IRegion[];
  target: string;
}

export class CloudfoundryDisableAsgStageConfig extends React.Component<
  ICloudfoundryDisableAsgStageProps,
  ICloudfoundryDisableAsgStageConfigState
> {
  constructor(props: ICloudfoundryDisableAsgStageProps) {
    super(props);
    props.stage.cloudProvider = 'cloudfoundry';
    this.state = {
      accounts: [],
      application: props.application,
      cloudProvider: 'cloudfoundry',
      credentials: props.stage.credentials,
      pipeline: props.pipeline,
      region: props.stage.region,
      regions: [],
      target: props.stage.target,
    };
  }

  public componentDidMount = (): void => {
    AccountService.listAccounts('cloudfoundry').then(accounts => {
      this.setState({ accounts: accounts });
      this.accountUpdated();
    });
    this.props.stageFieldUpdated();
  };

  private accountUpdated = (): void => {
    const { credentials } = this.props.stage;
    if (credentials) {
      AccountService.getRegionsForAccount(credentials).then(regions => {
        this.setState({ regions: regions });
      });
    }
  };

  private targetUpdated = (target: string) => {
    this.setState({ target });
    this.props.stage.target = target;
    this.props.stageFieldUpdated();
  };

  private componentUpdate = (stage: any): void => {
    this.props.stage.credentials = stage.credentials;
    this.props.stage.regions = stage.regions;
    this.props.stage.cluster = stage.cluster;
    this.props.stageFieldUpdated();
  };

  public render() {
    const { stage } = this.props;
    const { accounts, application, pipeline, target } = this.state;
    const { TargetSelect } = NgReact;
    return (
      <div className="form-horizontal">
        {!pipeline.strategy && (
          <AccountRegionClusterSelector
            accounts={accounts}
            application={application}
            cloudProvider={'cloudfoundry'}
            onComponentUpdate={this.componentUpdate}
            component={stage}
          />
        )}

        <StageConfigField label="Target">
          <TargetSelect model={{ target }} options={StageConstants.TARGET_LIST} onChange={this.targetUpdated} />
        </StageConfigField>
      </div>
    );
  }
}
