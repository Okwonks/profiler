/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import { PureComponent } from 'react';
import explicitConnect from '../../utils/connect';

import {
  retrieveProfileFromAddon,
  retrieveProfileFromStore,
  retrieveProfileOrZipFromUrl,
  retrieveProfilesToCompare,
} from '../../actions/receive-profile';
import {
  getDataSource,
  getHash,
  getProfileUrl,
  getProfilesToCompare,
} from '../../selectors/url-state';

import type { ConnectedProps } from '../../utils/connect';
import type { DataSource } from '../../types/actions';

type StateProps = {|
  +dataSource: DataSource,
  +hash: string,
  +profileUrl: string,
  +profilesToCompare: string[] | null,
|};

type DispatchProps = {|
  +retrieveProfileFromAddon: typeof retrieveProfileFromAddon,
  +retrieveProfileFromStore: typeof retrieveProfileFromStore,
  +retrieveProfileOrZipFromUrl: typeof retrieveProfileOrZipFromUrl,
  +retrieveProfilesToCompare: typeof retrieveProfilesToCompare,
|};

type Props = ConnectedProps<{||}, StateProps, DispatchProps>;

class ProfileLoaderImpl extends PureComponent<Props> {
  _retrieveProfileFromDataSource = () => {
    const {
      dataSource,
      hash,
      profileUrl,
      profilesToCompare,
      retrieveProfileFromAddon,
      retrieveProfileFromStore,
      retrieveProfileOrZipFromUrl,
      retrieveProfilesToCompare,
    } = this.props;
    switch (dataSource) {
      case 'from-addon':
        retrieveProfileFromAddon().catch(e => console.error(e));
        break;
      case 'from-file':
        // retrieveProfileFromFile should already have been called
        break;
      case 'local':
        break;
      case 'public':
        retrieveProfileFromStore(hash).catch(e => console.error(e));
        break;
      case 'from-url':
        retrieveProfileOrZipFromUrl(profileUrl).catch(e => console.error(e));
        break;
      case 'compare':
        if (profilesToCompare) {
          retrieveProfilesToCompare(profilesToCompare);
        }
        break;
      case 'none':
        // nothing to do
        break;
      default:
        throw new Error(`Unknown datasource ${dataSource}`);
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.dataSource === 'none' && this.props.dataSource !== 'none') {
      this._retrieveProfileFromDataSource();
    } else if (
      this.props.dataSource === 'compare' &&
      !prevProps.profilesToCompare &&
      this.props.profilesToCompare
    ) {
      this.props.retrieveProfilesToCompare(this.props.profilesToCompare);
    }
  }

  render() {
    return null;
  }
}

export const ProfileLoader = explicitConnect<{||}, StateProps, DispatchProps>({
  mapStateToProps: state => ({
    dataSource: getDataSource(state),
    hash: getHash(state),
    profileUrl: getProfileUrl(state),
    profilesToCompare: getProfilesToCompare(state),
  }),
  mapDispatchToProps: {
    retrieveProfileFromStore,
    retrieveProfileOrZipFromUrl,
    retrieveProfileFromAddon,
    retrieveProfilesToCompare,
  },
  component: ProfileLoaderImpl,
});
