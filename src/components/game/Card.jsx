import React from 'react';
import PropTypes from 'prop-types';
import { request, getGame } from '../axios_helper';
import './Card.css';

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
    const getImagePath = (name) => `/assets/images/${name}.png`;

    return (
      <div className="card">
        <img className={`card-image ${cardSelected ? 'selected' : ''}`} onClick={this.handleSelectedCard} src={getImagePath(cardName)} alt={cardName} />
      </div>
    );
  }
}

Card.propTypes = {
  cardName: PropTypes.string.isRequired,
  onCardSelection: PropTypes.func.isRequired,
};
