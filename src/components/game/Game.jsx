import React from 'react';
import { toast } from 'react-toastify';
import { request, getToken, getGame, refreshToken } from '../axios_helper';
import PropTypes from 'prop-types';
import './Game.css';
import Card from './Card';
import Background from '/assets/images/GameBackground.jpg';
import Deck from '/assets/images/ScuttleDeck.png';

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user: {},
            deckHover: false,
            isTreasure: false,
            hasAbility: false,
            hasLifeboat: false,
            showPopup: false,
            showPopupCards: false,
            showPopupPlayersLongJohnSilver: false,
            showPopupCardsPermanentMadameChing: false,
            showPopupCardsTreasureMadameChing: false,
            showPopupPlayersStowaway: false,
            showPopupNumberMutiny: false,
            showPopupLifeboat: false,
            showPopupCardsCutlass: false,
            showPopupCardsMonkey: false,
            showPopupPlayersCannon: false,
            showPopupFirstCardCannon: false,
            showPopupSecondCardCannon: false,
            showPopupCardsSkeletonKey: false,
            showPopupCardsPirateCode: false,
            showPopupCardsLookout: false,
            showPopupEndGame: false,
            card: '',
            card2: '',
            cards: [],
            cardsLifeboat: [],
            cardsCannon: [],
            players: [],
            player: '',
            playerLifeboat: '',
            playerCannon: '',
            number: 0,
        };
    }

    getPlayer = () => {
        return JSON.parse(localStorage.getItem('player'));
    }

    getActualGame = () => {
        return JSON.parse(localStorage.getItem('game'));
    }

    getHand = async () => {
        try {
            const response = await request('GET', '/game/hand', {});
            if (response.status === 200) {
                localStorage.setItem('player', JSON.stringify(response.data));
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
        }
    }

    getGameData = async () => {
        try {
            const response = await request('GET', `/game/${getGame()}`, {});
            if (response.status === 200) {
                localStorage.setItem('game', JSON.stringify(response.data));
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
        }
    }

    async componentDidMount() {
        this.pollingInterval = setInterval(async () =>{
            this.getGameData();
            this.getHand();
            this.checkPopupLifeboat();
            this.checkPopupCannon();
        }, 5000);
        this.checkEndGame();
        this.checkPlayers();
        this.getGameData();
        this.getHand();
        this.checkPirateCode();
        this.checkFirstMate();
        this.checkPirateKing();
        try {
            const response = await request('GET', '/home', {});
            if (response.status === 200 && response.data === getToken) {
                toast.success(response.data);
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else if (error.response.data !== getToken) {
                const response2 = await request('POST', `/game/${getGame()}/finish-game`);
                if (response2.status === 200) {
                    window.location.href = '/login';
                    sessionStorage.setItem('loginExpired', 'true');
                }
            } else
                toast.error('Something went wrong');
        }
        this.props.onLoadingChange(false);
        refreshToken();
        try {
            const response = await request('GET', '/user', {});
            if (response.status === 200) {
                this.setState({ user: response.data });
                this.checkJollyRoger();
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
        }
        document.addEventListener('click', this.handleDeckOnClick);
    }

    handlePopupEndGame = async () => {
        this.setState({ showPopupEndGame: false });
        await request('POST', `/game/${getGame()}/leave-game`);
        sessionStorage.removeItem('ready');
        sessionStorage.removeItem('host');
        sessionStorage.removeItem('numPlayers');
        sessionStorage.removeItem('game');
        sessionStorage.removeItem('gameStarted');
        localStorage.clear();
        window.location.href = '/home';
    }

    endGame = async () => {
        try {
            const response = await request('POST', `/game/${getGame()}/end-game`, {});
            if (response.status === 200) {
                this.setState({ player: response.data, showPopupEndGame: true });
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkEndGame = async () => {
        try {
            const response = await request('GET', `/game/${getGame()}/end-game`, {});
            if (response.status === 200 && response.data === true) {
                this.endGame();
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkPlayers = async () => {
        try {
            await request('GET', `/game/${getGame()}/players`, {});                
        } catch (error) {
            if (error.response.status === 400) {
                sessionStorage.removeItem('ready');
                sessionStorage.removeItem('host');
                sessionStorage.removeItem('numPlayers');
                sessionStorage.removeItem('game');
                sessionStorage.removeItem('gameStarted');
                localStorage.clear();
                sessionStorage.setItem('gameDeleted', 'true')
                window.location.href = '/home';    
            }else if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            }
        }
    }

    jollyRogerAction = async () => {
        try {
            await request('POST', `/game/${getGame()}/jolly-roger-action`, {
                player: this.state.user.username,
            });
            this.checkShipsWheel();
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkJollyRoger = async () => {
        try {
            const response = await request('GET', `/game/${getGame()}/jolly-roger`, {});
            if (response.status === 200 && response.data !== "" && response.data === this.state.user.username) {
                this.jollyRogerAction();
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkStowaway = async () => {
        try {
            await request('POST', `/game/${getGame()}/stowaway-check`, {});
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkSpyglass = async () => {
        try {
            await request('POST', `/game/${getGame()}/spyglass-check`, {});
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkPirateCode = async () => {
        try {
            await request('POST', `/game/${getGame()}/pirate-code-check`, {});
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkFirstMate = async () => {
        try {
            await request('POST', `/game/${getGame()}/first-mate-check`, {});
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkPirateKing = async () => {
        try {
            await request('POST', `/game/${getGame()}/pirate-king-check`, {});
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    shipsWheelAction = async (player) => {
        try {
            const response = await request('POST', `/game/${getGame()}/ships-wheel-action`, {
                player: player,
            });
            if(response.status === 200) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkShipsWheel = async () => {
        try {
            this.getActualGame().players.map((player) => (
                player.playedCards.map((card) => {
                    if (card.name === 'ShipsWheel' && card.playedAsPermanent === true && player.user.name !== this.state.user.username) {
                        this.setState({ hasShipsWheel: true, player: player.user.name });
                    }
                })
            ));
            const response = await request('GET', `/game/${getGame()}/ships-wheel`);
            if(response.status === 200 && response.data > 0 && this.state.hasShipsWheel) {
                this.shipsWheelAction(this.state.player);
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkPopupCannon = async () => {
        try {
            const response = await request('GET', `/game/${getGame()}/show-popup-cannon`);
            const showPopupFirstCardCannon = response.data["showPopupFirstCardCannon"];
            const showPopupSecondCardCannon = response.data["showPopupSecondCardCannon"];
            const playerCannon = response.data["playerName"];
            const cardsCannon = response.data["cardsCannon"];
            this.setState({ showPopupFirstCardCannon, showPopupSecondCardCannon, playerCannon, cardsCannon });
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    triggerPopupCannon = async (cards) => {
        try {
            const response = await request('POST', `/game/${getGame()}/trigger-popup-cannon`, {
                cardsCannon: cards,
            });
            this.setState({ playerCannon: response.data });
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    checkPopupLifeboat = async () => {
        try {
            const response = await request('GET', `/game/${getGame()}/show-popup-lifeboat`);
            const showPopupLifeboat = response.data["showPopupLifeboat"];
            const playerLifeboat = response.data["playerName"];
            const cardsLifeboat = response.data["cardsLifeboat"];
            this.setState({ showPopupLifeboat, playerLifeboat, cardsLifeboat });
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    triggerPopupLifeboat = async (cards) => {
        try {
            const response = await request('POST', `/game/${getGame()}/trigger-popup-lifeboat`, {
                cardsLifeboat: cards,
            });
            this.setState({ playerLifeboat: response.data });
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    handleDeckMouseOver = () => {
        if (this.getActualGame().turn === this.state.user.username) {
            this.setState({ deckHover: true });
        }
    }

    handleDeckMouseOut = () => {
        if (this.getActualGame().turn === this.state.user.username) {
            this.setState({ deckHover: false });
        }
    }

    handleDeckOnClick = async () => {
        if (this.getActualGame().turn === this.state.user.username && this.state.deckHover) {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/draw-card-turn`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                this.checkShipsWheel();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        }
    }

    handleCardOnClick = (cardName) => {
        if (this.getActualGame().turn === this.state.user.username) {
            this.getActualGame().players.map((player) => (
                player.user.name === this.state.user.username && (
                    player.hand.map((card) => {
                        if (card.name === cardName && card.description != '') {
                            this.setState({ isTreasure: card.treasure, hasAbility: true });
                        } else if (card.name === cardName && card.description == '') {
                            this.setState({ isTreasure: card.treasure, hasAbility: false });
                        }
                    })
                )
            ));
        }
    };

    handleCardSelection = (cardName) => {
        this.setState({ card: cardName });
    }

    handleCardSelection2 = (cardName) => {
        this.setState({ card2: cardName });
    }

    handlePopup = () => {
        this.setState({ showPopup: !this.state.showPopup });
    }

    handlePopupCards = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCards: false });
        const response = await request('POST', `/game/${getGame()}/chosen-card-henry-morgan`, {
            card: this.state.card,
        });
        if (response.status === 200) {
            this.getHand();
            this.getGameData();
            this.checkShipsWheel();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        }
    }

    handlePopupPlayers = async (playerName) => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupPlayersLongJohnSilver: false });
        const response = await request('POST', `/game/${getGame()}/chosen-player-long-john-silver`, {
            player: playerName,
        });
        if (response.status === 200) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        }
    }

    handlePopupCardsPermanentMadameChing = async () => {
        this.setState({ showPopupCardsPermanentMadameChing: false, showPopupCardsTreasureMadameChing: true, cards: this.state.card });
    }

    handlePopupCardsTreasureMadameChing = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCardsTreasureMadameChing: false });
        const response =  await request('POST', `/game/${getGame()}/chosen-cards-madame-ching`, {
            card: this.state.card,
            card2: this.state.card2,
        });
        if (response.status === 200) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        }
    }

    handlePopupPlayersStowaway = async (playerName) => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupPlayersStowaway: false });
        const response = await request('POST', `/game/${getGame()}/chosen-player-stowaway`, {
            player: playerName,
        });
        if (response.status === 200) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        }
    }

    handlePopupNumberMutiny = async (number) => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupNumberMutiny: false });
        this.getActualGame().players.map((player) => (
            player.playedCards.map((card) => {
                if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                    this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                }
            })
        ));
        const response = await request('POST', `/game/${getGame()}/mutiny`, {
            number: number,
        });
        if (response.status === 200 && this.state.hasLifeboat === false) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        } else if (response.status === 200 && this.state.hasLifeboat === true) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
            this.triggerPopupLifeboat(response.data);
            this.setState({ cards: response.data, showPopupLifeboat: true });
        }
    }

    handlePopupLifeboat = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupLifeboat: false });
        this.triggerPopupLifeboat();
        await request('POST', `/game/${getGame()}/saved-card-lifeboat`, {
            card: this.state.card,
            player: this.state.playerLifeboat,
        });
        this.getHand();
        this.getGameData();
        setTimeout(() => {
            document.body.style.cursor = 'default';
            window.location.reload();
        }, 1500);
    }

    handlePopupCancelLifeboat = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupLifeboat: false });
        this.triggerPopupLifeboat();
        this.getHand();
        this.getGameData();
        setTimeout(() => {
            document.body.style.cursor = 'default';
            window.location.reload();
        }, 1500);
    }

    handlePopupCardsCutlass = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCardsCutlass: false });
        this.getActualGame().players.map((player) => (
            player.playedCards.map((card) => {
                if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                    this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                }
            })
        ));
        const response = await request('POST', `/game/${getGame()}/chosen-card-cutlass`, {
            card: this.state.card,
        });
        if(response.status === 200 && this.state.hasLifeboat === false) {
            this.getHand();
            this.getGameData();
            this.checkShipsWheel();
            this.checkSpyglass();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        } else if(response.status === 200 && this.state.hasLifeboat === true) {
            this.getHand();
            this.getGameData();
            this.checkShipsWheel();
            this.checkSpyglass();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
            this.triggerPopupLifeboat(response.data);
            this.setState({ cards: response.data, showPopupLifeboat: true });
        }
    }

    handlePopupCardsMonkey = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCardsMonkey: false });
        const response = await request('POST', `/game/${getGame()}/chosen-card-monkey`, {
            card: this.state.card,
        });
        if(response.status === 200) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        }
    }

    handlePopupPlayersCannon = async (playerName) => {
        this.setState({ showPopupPlayersCannon: false });
        const response = await request('POST', `/game/${getGame()}/chosen-player-cannon`, {
            player: playerName,
        });
        if (response.status === 200) {
            this.triggerPopupCannon(response.data);
            this.setState({ cards: response.data, showPopupFirstCardCannon: true });
        }
    }

    handlePopupFirstCardCannon = async () => {
        this.triggerPopupCannon(this.state.cardsCannon);
        this.setState({ card: this.state.card });
    }

    handlePopupSecondCardCannon = async () => {
        document.body.style.cursor = 'wait';
        this.getActualGame().players.map((player) => (
            player.playedCards.map((card) => {
                if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                    this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                }
            })
        ));
        const response = await request('POST', `/game/${getGame()}/chosen-cards-cannon`, {
            card: this.state.card,
            card2: this.state.card2,
        });
        if (response.status === 200 && this.state.hasLifeboat === false) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
            this.setState({ isTreasure: false, hasAbility: false });
        } else if (response.status === 200 && this.state.hasLifeboat === true) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
            this.triggerPopupLifeboat(response.data);
            this.setState({ cards: response.data, showPopupLifeboat: true, isTreasure: false, hasAbility: false });
        }
    }

    handlePopupCardsSkeletonKey = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCardsSkeletonKey: false });
        await request('POST', `/game/${getGame()}/chosen-card-skeleton-key`, {
            card: this.state.card,
        });
        this.getHand();
        this.getGameData();
        this.checkShipsWheel();
        setTimeout(() => {
            document.body.style.cursor = 'default';
            window.location.reload();
        }, 1500);
    }

    handlePopupCardsPirateCode = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCardsPirateCode: false });
        await request('POST', `/game/${getGame()}/chosen-card-pirate-code`, {
            card: this.state.card,
        });
        this.getHand();
        this.getGameData();
        setTimeout(() => {
            document.body.style.cursor = 'default';
            window.location.reload();
        }, 1500);
    }

    handlePopupCardsLookout = async () => {
        document.body.style.cursor = 'wait';
        this.setState({ showPopupCardsLookout: false });
        try {
            const response = await request('POST', `/game/${getGame()}/chosen-card-lookout`, {
                card: this.state.card,
            });
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            if (error.response.status === 404) {
                toast.error(error.response.data);
            } else
                toast.error('Something went wrong');
        }
    }

    handleTreasure = async () => {
        document.body.style.cursor = 'wait';
        this.setState({showPopupCardsSkeletonKey: false })
        const response = await request('POST', `/game/${getGame()}/play-treasure-card`, {});
        if (response.status === 200) {
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1500);
        }
    }

    handleAbility = async () => {
        this.setState({showPopupCardsSkeletonKey: false })
        const response = await request('POST', `/game/${getGame()}/play-ability-card`, {});
        if (response.status === 200) {
            const cardName = response.data;
            if (Object.prototype.hasOwnProperty.call(this.handleCardActions, cardName)) {
                await this.handleCardActions[cardName]();
            }
        }
    }

    handleCardActions = {
        AnneBonny: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('GET', `/game/${getGame()}/anne-bonny`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                this.checkShipsWheel();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        HenryMorgan: async () => {
            const response = await request('GET', `/game/${getGame()}/henry-morgan`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCards: true });
            }
        },
        LongJohnSilver: async () => {
            const response = await request('GET', `/game/${getGame()}/long-john-silver`, {});
            if (response.status === 200) {
                this.setState({ players: response.data, showPopupPlayersLongJohnSilver: true });
            }
        },
        MadameChing: async () => {
            try {
                const response = await request('GET', `/game/${getGame()}/madame-ching`, {});
                if (response.status === 200) {
                    this.setState({ cards: response.data, showPopupCardsPermanentMadameChing: true });
                }
            } catch (error) {
                if (error.response.status === 400) {
                    toast.error("You can't play this card now");
                } else
                    toast.error('Something went wrong');
            }
        },
        Stowaway: async () => {
            const response = await request('GET', `/game/${getGame()}/stowaway`, {});
            if (response.status === 200) {
                this.setState({ players: response.data, showPopupPlayersStowaway: true });
            }
        },
        Maelstrom: async () => {
            document.body.style.cursor = 'wait';
            this.getActualGame().players.map((player) => (
                player.playedCards.map((card) => {
                    if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                        this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                    }
                })
            ));
            const response = await request('POST', `/game/${getGame()}/maelstrom`, {});
            if (response.status === 200 && this.state.hasLifeboat === false) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            } else if (response.status === 200 && this.state.hasLifeboat === true) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
                this.triggerPopupLifeboat(response.data);
                this.setState({ cards: response.data, showPopupLifeboat: true });
            }
        },
        Mutiny: async () => {
            this.setState({ showPopupNumberMutiny: true });
        },
        ShiverMeTimbers: async () => {
            document.body.style.cursor = 'wait';
            this.getActualGame().players.map((player) => (
                player.playedCards.map((card) => {
                    if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                        this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                    }
                })
            ));
            const response = await request('POST', `/game/${getGame()}/shiver-me-timbers`, {});
            if (response.status === 200 && this.state.hasLifeboat === false) {
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            } else if (response.status === 200 && this.state.hasLifeboat === true) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
                this.triggerPopupLifeboat(response.data);
                this.setState({ cards: response.data, showPopupLifeboat: true });
            }
        },
        Lifeboat: async () => {
            document.body.style.cursor = 'wait';
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1000);
        },
        JollyRoger: async () => {
            document.body.style.cursor = 'wait';
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1000);
        },
        ShipsWheel: async () => {
            document.body.style.cursor = 'wait';
            this.getHand();
            this.getGameData();
            setTimeout(() => {
                document.body.style.cursor = 'default';
                window.location.reload();
            }, 1000);
        },
        CutlassEyepatch: async () => {
            const response = await request('GET', `/game/${getGame()}/cutlass`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsCutlass: true });
            }
        },
        CutlassSkull: async () => {
            const response = await request('GET', `/game/${getGame()}/cutlass`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsCutlass: true });
            }
        },
        CutlassHook: async () => {
            const response = await request('GET', `/game/${getGame()}/cutlass`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsCutlass: true });
            }
        },
        MonkeyEyepatch: async () => {
            const response = await request('GET', `/game/${getGame()}/monkey`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsMonkey: true });
            }
        },
        MonkeySkull: async () => {
            const response = await request('GET', `/game/${getGame()}/monkey`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsMonkey: true });
            }
        },
        MonkeyHook: async () => {
            const response = await request('GET', `/game/${getGame()}/monkey`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsMonkey: true });
            }
        },
        CannonEyepatch: async () => {
            const response = await request('GET', `/game/${getGame()}/cannon`, {});
            if (response.status === 200) {
                this.setState({ players: response.data, showPopupPlayersCannon: true });
            }
        },
        CannonSkull: async () => {
            const response = await request('GET', `/game/${getGame()}/cannon`, {});
            if (response.status === 200) {
                this.setState({ players: response.data, showPopupPlayersCannon: true });
            }
        },
        CannonHook: async () => {
            const response = await request('GET', `/game/${getGame()}/cannon`, {});
            if (response.status === 200) {
                this.setState({ players: response.data, showPopupPlayersCannon: true });
            }
        },
        TreasureMapEyepatch: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('GET', `/game/${getGame()}/treasure-map`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        TreasureMapSkull: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('GET', `/game/${getGame()}/treasure-map`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        TreasureMapHook: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('GET', `/game/${getGame()}/treasure-map`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        KrakenEyepatch: async () => {
            document.body.style.cursor = 'wait';
            this.getActualGame().players.map((player) => (
                player.playedCards.map((card) => {
                    if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                        this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                    }
                })
            ));
            const response = await request('POST', `/game/${getGame()}/kraken`, {});
            if (response.status === 200 && this.state.hasLifeboat === false) {
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }else if(response.status === 200 && this.state.hasLifeboat === true){
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
                this.triggerPopupLifeboat(response.data);
                this.setState({ cards: response.data, showPopupLifeboat: true });
            }
        },
        KrakenSkull: async () => {
            document.body.style.cursor = 'wait';
            this.getActualGame().players.map((player) => (
                player.playedCards.map((card) => {
                    if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                        this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                    }
                })
            ));
            const response = await request('POST', `/game/${getGame()}/kraken`, {});
            if (response.status === 200 && this.state.hasLifeboat === false) {
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }else if(response.status === 200 && this.state.hasLifeboat === true){
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
                this.triggerPopupLifeboat(response.data);
                this.setState({ cards: response.data, showPopupLifeboat: true });
            }
        },
        KrakenHook: async () => {
            document.body.style.cursor = 'wait';
            this.getActualGame().players.map((player) => (
                player.playedCards.map((card) => {
                    if (card.name === 'Lifeboat' && card.playedAsPermanent === true) {
                        this.setState({ playerLifeboat: player.user.name, hasLifeboat: true });
                    }
                })
            ));
            const response = await request('POST', `/game/${getGame()}/kraken`, {});
            if (response.status === 200 && this.state.hasLifeboat === false) {
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }else if(response.status === 200 && this.state.hasLifeboat === true){
                this.getHand();
                this.getGameData();
                this.checkSpyglass();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
                this.triggerPopupLifeboat(response.data);
                this.setState({ cards: response.data, showPopupLifeboat: true });
            }
        },
        SkeletonKeyEyepatch: async () => {
            const response = await request('POST', `/game/${getGame()}/skeleton-key`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsSkeletonKey: true, isTreasure: false, hasAbility: false });
            }
        },
        SkeletonKeySkull: async () => {
            const response = await request('POST', `/game/${getGame()}/skeleton-key`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsSkeletonKey: true });
            }
        },
        SkeletonKeyHook: async () => {
            const response = await request('POST', `/game/${getGame()}/skeleton-key`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsSkeletonKey: true });
            }
        },
        SpyglassEyepatch: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/spyglass`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        SpyglassSkull: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/spyglass`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        SpyglassHook: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/spyglass`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        PirateCodeEyepatch: async () => {
            const response = await request('GET', `/game/${getGame()}/pirate-code`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsPirateCode: true });
            }
        },
        PirateCodeSkull: async () => {
            const response = await request('GET', `/game/${getGame()}/pirate-code`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsPirateCode: true });
            }
        },
        PirateCodeHook: async () => {
            const response = await request('GET', `/game/${getGame()}/pirate-code`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsPirateCode: true });
            }
        },
        LookoutEyepatch: async () => {
            const response = await request('GET', `/game/${getGame()}/lookout`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsLookout: true });
            }
        },
        LookoutSkull: async () => {
            const response = await request('GET', `/game/${getGame()}/lookout`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsLookout: true });
            }
        },
        LookoutHook: async () => {
            const response = await request('GET', `/game/${getGame()}/lookout`, {});
            if (response.status === 200) {
                this.setState({ cards: response.data, showPopupCardsLookout: true });
            }
        },
        FirstMateEyepatch: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/first-mate`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        FirstMateSkull: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/first-mate`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        FirstMateHook: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/first-mate`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        PirateKingEyepatch: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/pirate-king`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        PirateKingSkull: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/pirate-king`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
        PirateKingHook: async () => {
            document.body.style.cursor = 'wait';
            const response = await request('POST', `/game/${getGame()}/pirate-king`, {});
            if (response.status === 200) {
                this.getHand();
                this.getGameData();
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    window.location.reload();
                }, 1000);
            }
        },
    }

    render() {
        return (
            <React.Fragment>
                <div className='background-container'>
                    <img className='background' src={Background} alt='background' />
                </div>
                <div className='player-cards'>
                    {sessionStorage.getItem('gameStarted') && this.getActualGame().players.map((player) => (
                        player.user.name !== this.state.user.username && (
                            <div key={player.name} className='player'>
                                <React.Fragment>
                                    <div className='player-name'>{player.user.name} - {player.points} points</div>
                                    <div className='player-cards'>
                                        {player.hand.map((card) => (
                                            <div key={card.name} className='card'>
                                                {card.revealed === true && (
                                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardOnClick} />
                                                )}
                                                {card.revealed === false && (
                                                    <Card key={card.name} cardName={"Scuttle"} onCardSelection={this.handleCardOnClick} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </React.Fragment>
                            </div>
                        )
                    ))}
                </div>
                <div className='game-deck'>
                    <div className='deck'>
                        <label className='deck-label'>Deck</label>
                        <img className={`deck-image ${this.state.deckHover ? 'hovered' : ''}`} style={{
                            cursor: this.getActualGame().turn === this.state.user.username ? 'pointer' : 'default'
                        }} src={Deck} onMouseOver={this.handleDeckMouseOver} onMouseOut={this.handleDeckMouseOut} onClick={this.handleDeckOnClick} alt='deck' />
                        <label className='deck-text' style={{ visibility: this.state.deckHover ? 'visible' : 'hidden' }}> Draw </label>
                    </div>
                    <div className='played-cards'>
                        <button className='played-cards-button' onClick={this.handlePopup}>Played cards</button>
                        {this.state.showPopup && (
                            <div className='popup' id='popup'>
                                <div className='popup-content'>
                                    <span className='close' onClick={this.handlePopup}>&times;</span>
                                    <label className='popup-label'>Played cards</label>
                                    {this.getActualGame().players.map((player) => (
                                        <div key={player.name} className='player'>
                                            <React.Fragment>
                                                <div className='player-name'>{player.user.name}</div>
                                                <div className='played-cards'>
                                                    {player.playedCards.map((card) => (
                                                        <div key={card.name} className={`card ${card.playedAsPermanent ? 'rotated' : ''} ${card.destroyed ? 'dark' : ''} ${card.protected ? 'protect' : ''}`}>
                                                            <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardOnClick} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </React.Fragment>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='action-buttons'>
                        <button className='action-label' style={{ visibility: this.state.isTreasure ? 'visible' : 'hidden' }} onClick={this.handleTreasure} >Treasure</button>
                        <button className='action-label' style={{ visibility: this.state.hasAbility ? 'visible' : 'hidden' }} onClick={this.handleAbility} >Ability</button>
                    </div>
                </div>

                {this.state.showPopupCards && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose a card to draw</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCards}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupPlayersLongJohnSilver && (
                    <div className='popup' id='popup-players'>
                        <div className='popup-content'>
                            <label className='popup-label'>Choose a player to swap cards</label>
                            <div className='players-popup'>
                                {this.getActualGame().players.map((player) => (
                                    <div key={player.name} className='player'>
                                        {player.user.name !== this.state.user.username && (
                                            <button
                                                className='player-name'
                                                onClick={() => this.handlePopupPlayers(player.user.name)}
                                            >
                                                {player.user.name}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {this.state.showPopupCardsPermanentMadameChing && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Play 1 card as a permanent</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    {card.type === 'PERMANENT' && (
                                        <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCardsPermanentMadameChing}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupCardsTreasureMadameChing && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose 1 card as a treasure</label>
                        <div className='player-cards-popup'>
                            {this.getPlayer().hand.map((card) => (
                                <div key={card.name} className='card' >
                                    {card.treasure === true && card.name != this.state.card && (
                                        <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection2} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCardsTreasureMadameChing}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupPlayersStowaway && (
                    <div className='popup' id='popup-players'>
                        <div className='popup-content'>
                            <label className='popup-label'>Choose a player</label>
                            <div className='players-popup'>
                                {this.getActualGame().players.map((player) => (
                                    <div key={player.name} className='player'>
                                        {player.user.name !== this.state.user.username && (
                                            <button
                                                className='player-name'
                                                onClick={() => this.handlePopupPlayersStowaway(player.user.name)}
                                            >
                                                {player.user.name}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {this.state.showPopupNumberMutiny && (<div className='popup' id='popup-number'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose a number</label>
                        <input className='popup-input' type='number' min='1' onChange={event => this.setState({ number: event.target.value })} />
                        <button className='action-button' onClick={() => this.handlePopupNumberMutiny(this.state.number)}>OK</button>
                    </div>
                </div>)
                }

                {this.state.showPopupLifeboat && this.state.playerLifeboat === this.state.user.username && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Which card do you want to save with the Lifeboat?</label>
                        <div className='player-cards-popup'>
                            {this.state.cardsLifeboat.map((card) => (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                </div>
                            ))}
                        </div>
                        <div className='popup-buttons' style={{ display: "flex", flexDirection: "row", gap: "150px" }}>
                            <button className='action-button' onClick={this.handlePopupLifeboat}>OK</button>
                            <button className='action-button' onClick={this.handlePopupCancelLifeboat}>Don&apos;t save</button>
                        </div>
                    </div>
                </div>)}

                {this.state.showPopupCardsCutlass && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose 1 permanent card to destroy</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    {card.playedAsPermanent && card.protected === false && (
                                        <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCardsCutlass}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupCardsMonkey && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose 1 card from discard deck</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCardsMonkey}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupPlayersCannon && (<div className='popup' id='popup-players'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose a player</label>
                        <div className='players-popup'>
                        {this.state.players.map((player) => (
                            <div key={player.name} className='player'>
                                <button className='player-name' onClick={() => this.handlePopupPlayersCannon(player.user.name)}>{player.user.name}</button>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>)}

                {this.state.showPopupFirstCardCannon && this.state.playerCannon === this.state.user.username && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose 1 card to discard</label>
                        <div className='player-cards-popup'>
                            {this.state.cardsCannon.map((card) => (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupFirstCardCannon}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupSecondCardCannon && this.state.playerCannon === this.state.user.username && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose another card to discard</label>
                        <div className='player-cards-popup'>
                            {this.state.cardsCannon.map((card) => (
                                this.state.card !== card.name && (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection2}/>
                                </div>
                            )))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupSecondCardCannon}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupCardsSkeletonKey && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Play 1 card</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardOnClick} />
                                </div>
                            ))}
                        </div>
                        <div className='popup-buttons' style={{ display: "flex", flexDirection: "row", gap: "150px" }}>
                            <button className='action-button' style={{ visibility: this.state.isTreasure ? 'visible' : 'hidden' }} onClick={this.handleTreasure} >Treasure</button>
                            <button className='action-button' style={{ visibility: this.state.hasAbility ? 'visible' : 'hidden' }} onClick={this.handleAbility} >Ability</button>
                        </div>
                    </div>
                </div>)}

                {this.state.showPopupCardsPirateCode && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose 1 treasure to protect</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    {card.treasure === true && !card.playedAsPermanent && (
                                        <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCardsPirateCode}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupCardsLookout && (<div className='popup' id='popup-cards'>
                    <div className='popup-content'>
                        <label className='popup-label'>Choose 1 treasure</label>
                        <div className='player-cards-popup'>
                            {this.state.cards.map((card) => (
                                <div key={card.name} className='card'>
                                    <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardSelection} />
                                </div>
                            ))}
                        </div>
                        <button className='action-button' onClick={this.handlePopupCardsLookout}>OK</button>
                    </div>
                </div>)}

                {this.state.showPopupEndGame && (<div className='popup' id='popup-end-game'>
                    <div className='popup-content-centered'>
                        {this.state.player === this.state.user.username && (
                            <React.Fragment>
                                <label className='popup-label'>CONGRATULATIONS {this.state.user.username}!</label>
                                <label className='popup-label'>YOU WON THE GAME!</label>    
                            </React.Fragment>
                            )}
                        {this.state.player !== this.state.user.username && (
                            <React.Fragment>
                                <label className='popup-label'>Sorry, {this.state.user.username}</label>
                                <label className='popup-label'>You lost the game</label>    
                            </React.Fragment>
                            )}
                        <div className='popup-buttons' style={{ display: "flex", flexDirection: "row", gap: "150px" }}>
                            <button className='action-button' onClick={this.handlePopupEndGame}>OK</button>
                        </div>
                    </div>
                </div>)}

                <div className='game'>
                    {sessionStorage.getItem('gameStarted') && this.getPlayer().hand.map((card) => (
                        <Card key={card.name} cardName={card.name} onCardSelection={this.handleCardOnClick} />
                    ))}
                </div>
            </React.Fragment>
        );
    }
}

Game.propTypes = {
    onLoadingChange: PropTypes.func.isRequired,
};
