const axios = require('axios');

// Configuration de base
const BASE_HP = 300;
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

class Pokemon {
    constructor(name, moves) {
        this.name = name;
        this.moves = moves;
        this.hp = BASE_HP;
    }

    // Choisir un mouvement aléatoire pour le bot
    chooseRandomMove() {
        const randomIndex = Math.floor(Math.random() * this.moves.length);
        return this.moves[randomIndex];
    }

    // Attaquer avec un mouvement
    attack(move, target) {
        console.log(`\n${this.name} utilise ${move.name} !`);

        // Vérifier la précision
        const accuracyCheck = Math.random() * 100;
        if (accuracyCheck > move.accuracy) {
            console.log(`${this.name} a raté son attaque !`);
            return 0;
        }

        // Calcul des dégâts (simplifié)
        const damage = move.power || 40;
        target.hp -= damage;

        console.log(`C'est efficace ! ${target.name} perd ${damage} PV.`);
        console.log(`${target.name} : ${Math.max(0, target.hp)}/${BASE_HP} PV`);

        return damage;
    }

    isFainted() {
        return this.hp <= 0;
    }
}

// Récupérer les données d'un Pokémon
async function fetchPokemonData(pokemonName) {
    try {
        const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${pokemonName.toLowerCase()}`);
        return response.data;
    } catch (error) {
        throw new Error(`Pokémon "${pokemonName}" non trouvé !`);
    }
}

// Récupérer les mouvements d'un Pokémon (5 premiers)
async function fetchPokemonMoves(pokemonData) {
    const moves = [];

    // Prendre les 5 premiers mouvements
    const selectedMoves = pokemonData.moves.slice(0, 5);

    for (const moveData of selectedMoves) {
        try {
            const moveResponse = await axios.get(moveData.move.url);
            const moveDetail = moveResponse.data;

            moves.push({
                name: moveDetail.name,
                power: moveDetail.power || 40, // Valeur par défaut si non définie
                accuracy: moveDetail.accuracy || 100 // Valeur par défaut si non définie
            });
        } catch (error) {
            // Mouvement par défaut en cas d'erreur
            moves.push({
                name: moveData.move.name,
                power: 40,
                accuracy: 100
            });
        }
    }

    return moves;
}

// Afficher les informations d'un Pokémon
function displayPokemonInfo(pokemon) {
    console.log(`\n=== ${pokemon.name.toUpperCase()} ===`);
    console.log(`PV: ${pokemon.hp}/${BASE_HP}`);
    console.log("Mouvements:");
    pokemon.moves.forEach((move, index) => {
        console.log(`  ${index + 1}. ${move.name} - Puissance: ${move.power} - Précision: ${move.accuracy}%`);
    });
}

// Jeu principal
async function startGame() {
    console.log("🎮 BIENVENUE DANS LE JEU POKÉMON ! 🎮\n");

    try {
        // Choix du Pokémon du joueur
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const playerPokemonName = await new Promise((resolve) => {
            readline.question("Choisis ton Pokémon (ex: pikachu, charizard, bulbasaur): ", resolve);
        });

        console.log(`\nChargement de ${playerPokemonName}...`);

        // Récupération des données du Pokémon du joueur
        const playerData = await fetchPokemonData(playerPokemonName);
        const playerMoves = await fetchPokemonMoves(playerData);
        const player = new Pokemon(playerData.name, playerMoves);

        // Pokémon adverse (aléatoire)
        const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Gen 1
        const enemyData = await fetchPokemonData(randomPokemonId.toString());
        const enemyMoves = await fetchPokemonMoves(enemyData);
        const enemy = new Pokemon(enemyData.name, enemyMoves);

        readline.close();

        console.log(`\n⭐ TON POKÉMON: ${player.name.toUpperCase()}`);
        console.log(`⚡ POKÉMON ADVERSE: ${enemy.name.toUpperCase()}`);
        console.log("\nLe combat commence !");

        // Interface pour le combat
        const combatInterface = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let round = 1;

        while (!player.isFainted() && !enemy.isFainted()) {
            console.log(`\n=== TOUR ${round} ===`);

            // Tour du joueur
            console.log(`\n--- Tour de ${player.name} ---`);
            displayPokemonInfo(player);

            const moveChoice = await new Promise((resolve) => {
                combatInterface.question(`Choisis un mouvement (1-${player.moves.length}): `, resolve);
            });

            const moveIndex = parseInt(moveChoice) - 1;

            if (moveIndex >= 0 && moveIndex < player.moves.length) {
                const selectedMove = player.moves[moveIndex];
                player.attack(selectedMove, enemy);
            } else {
                console.log("Mouvement invalide ! Attaque ratée.");
            }

            // Vérifier si l'ennemi est K.O.
            if (enemy.isFainted()) {
                console.log(`\n🎉 ${enemy.name} est K.O. ! ${player.name} remporte le combat !`);
                break;
            }

            // Tour de l'ennemi
            console.log(`\n--- Tour de ${enemy.name} ---`);
            const enemyMove = enemy.chooseRandomMove();
            enemy.attack(enemyMove, player);

            // Vérifier si le joueur est K.O.
            if (player.isFainted()) {
                console.log(`\n💀 ${player.name} est K.O. ! ${enemy.name} remporte le combat !`);
                break;
            }

            round++;
        }

        combatInterface.close();

    } catch (error) {
        console.error("Erreur:", error.message);
    }
}

// Démarrer le jeu
startGame();