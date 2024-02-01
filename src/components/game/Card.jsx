import React from 'react';
import PropTypes from 'prop-types';
import { request, getGame } from '../axios_helper';
import './Card.css';

import AnneBonny from '../../assets/images/AnneBonny.png';
import CannonEyepatch from '../../assets/images/CannonEyepatch.png';
import CannonHook from '../../assets/images/CannonHook.png';
import CannonSkull from '../../assets/images/CannonSkull.png';
import CutlassEyepatch from '../../assets/images/CutlassEyepatch.png';
import CutlassHook from '../../assets/images/CutlassHook.png';
import CutlassSkull from '../../assets/images/CutlassSkull.png';
import DavyJones from '../../assets/images/DavyJones.png';
import FirstMateEyepatch from '../../assets/images/FirstMateEyepatch.png';
import FirstMateHook from '../../assets/images/FirstMateHook.png';
import FirstMateSkull from '../../assets/images/FirstMateSkull.png';
import HenryMorgan from '../../assets/images/HenryMorgan.png';
import JollyRoger from '../../assets/images/JollyRoger.png';
import KrakenEyepatch from '../../assets/images/KrakenEyepatch.png';
import KrakenHook from '../../assets/images/KrakenHook.png';
import KrakenSkull from '../../assets/images/KrakenSkull.png';
import Lifeboat from '../../assets/images/Lifeboat.png';
import LongJohnSilver from '../../assets/images/LongJohnSilver.png';
import LookoutEyepatch from '../../assets/images/LookoutEyepatch.png';
import LookoutHook from '../../assets/images/LookoutHook.png';
import LookoutSkull from '../../assets/images/LookoutSkull.png';
import MadameChing from '../../assets/images/MadameChing.png';
import Maelstrom from '../../assets/images/Maelstrom.png';
import MonkeyEyepatch from '../../assets/images/MonkeyEyepatch.png';
import MonkeyHook from '../../assets/images/MonkeyHook.png';
import MonkeySkull from '../../assets/images/MonkeySkull.png';
import Mutiny from '../../assets/images/Mutiny.png';
import PirateCodeEyepatch from '../../assets/images/PirateCodeEyepatch.png';
import PirateCodeHook from '../../assets/images/PirateCodeHook.png';
import PirateCodeSkull from '../../assets/images/PirateCodeSkull.png';
import PirateKingEyepatch from '../../assets/images/PirateKingEyepatch.png';
import PirateKingHook from '../../assets/images/PirateKingHook.png';
import PirateKingSkull from '../../assets/images/PirateKingSkull.png';
import RobotPirate from '../../assets/images/RobotPirate.png';
import Scuttle from '../../assets/images/Scuttle.png';
import ShipsWheel from '../../assets/images/ShipsWheel.png';
import ShiverMeTimbers from '../../assets/images/ShiverMeTimbers.png';
import SkeletonKeyEyepatch from '../../assets/images/SkeletonKeyEyepatch.png';
import SkeletonKeyHook from '../../assets/images/SkeletonKeyHook.png';
import SkeletonKeySkull from '../../assets/images/SkeletonKeySkull.png';
import SpyglassEyepatch from '../../assets/images/SpyglassEyepatch.png';
import SpyglassHook from '../../assets/images/SpyglassHook.png';
import SpyglassSkull from '../../assets/images/SpyglassSkull.png';
import Stowaway from '../../assets/images/Stowaway.png';
import TreasureChestEyepatch from '../../assets/images/TreasureChestEyepatch.png';
import TreasureChestHook from '../../assets/images/TreasureChestHook.png';
import TreasureChestSkull from '../../assets/images/TreasureChestSkull.png';
import TreasureMapEyepatch from '../../assets/images/TreasureMapEyepatch.png';
import TreasureMapHook from '../../assets/images/TreasureMapHook.png';
import TreasureMapSkull from '../../assets/images/TreasureMapSkull.png';

const cardImages = {
  'AnneBonny': AnneBonny,
  'CannonEyepatch': CannonEyepatch,
  'CannonHook': CannonHook,
  'CannonSkull': CannonSkull,
  'CutlassEyepatch': CutlassEyepatch,
  'CutlassHook': CutlassHook,
  'CutlassSkull': CutlassSkull,
  'DavyJones': DavyJones,
  'FirstMateEyepatch': FirstMateEyepatch,
  'FirstMateHook': FirstMateHook,
  'FirstMateSkull': FirstMateSkull,
  'HenryMorgan': HenryMorgan,
  'JollyRoger': JollyRoger,
  'KrakenEyepatch': KrakenEyepatch,
  'KrakenHook': KrakenHook,
  'KrakenSkull': KrakenSkull,
  'Lifeboat': Lifeboat,
  'LongJohnSilver': LongJohnSilver,
  'LookoutEyepatch': LookoutEyepatch,
  'LookoutHook': LookoutHook,
  'LookoutSkull': LookoutSkull,
  'MadameChing': MadameChing,
  'Maelstrom': Maelstrom,
  'MonkeyEyepatch': MonkeyEyepatch,
  'MonkeyHook': MonkeyHook,
  'MonkeySkull': MonkeySkull,
  'Mutiny': Mutiny,
  'PirateCodeEyepatch': PirateCodeEyepatch,
  'PirateCodeHook': PirateCodeHook,
  'PirateCodeSkull': PirateCodeSkull,
  'PirateKingEyepatch': PirateKingEyepatch,
  'PirateKingHook': PirateKingHook,
  'PirateKingSkull': PirateKingSkull,
  'RobotPirate': RobotPirate,
  'Scuttle': Scuttle,
  'ShipsWheel': ShipsWheel,
  'ShiverMeTimbers': ShiverMeTimbers,
  'SkeletonKeyEyepatch': SkeletonKeyEyepatch,
  'SkeletonKeyHook': SkeletonKeyHook,
  'SkeletonKeySkull': SkeletonKeySkull,
  'SpyglassEyepatch': SpyglassEyepatch,
  'SpyglassHook': SpyglassHook,
  'SpyglassSkull': SpyglassSkull,
  'Stowaway': Stowaway,
  'TreasureChestEyepatch': TreasureChestEyepatch,
  'TreasureChestHook': TreasureChestHook,
  'TreasureChestSkull': TreasureChestSkull,
  'TreasureMapEyepatch': TreasureMapEyepatch,
  'TreasureMapHook': TreasureMapHook,
  'TreasureMapSkull': TreasureMapSkull
};

export default class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cardSelected: false,
    };
  }

  handleSelectedCard = async () => {
    const allCards = document.querySelectorAll('.card-image');
    allCards.forEach((card) => {
      card.classList.remove('selected');
    });
    this.props.onCardSelection(this.props.cardName);
    this.setState({ cardSelected: !this.state.cardSelected });
    await request('POST', `/game/${getGame()}/choose-card`, {
      cardName: this.props.cardName,
    });
  };

  render() {
    const { cardName } = this.props;
    const { cardSelected } = this.state;
    const cardImage = cardImages[cardName];

    return (
      <div className="card">
        <img className={`card-image ${cardSelected ? 'selected' : ''}`} onClick={this.handleSelectedCard} src={cardImage} alt={cardName} />
      </div>
    );
  }
}

Card.propTypes = {
  cardName: PropTypes.string.isRequired,
  onCardSelection: PropTypes.func.isRequired,
};
