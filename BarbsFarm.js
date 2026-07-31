/*
 * Script Name: Barbs Finder - ES Farm Intelligence (FORK)
 * Fork Version: v2.6.0-ES-FORK
 * Fork Date: 2026-07-31
 * Original Project: Barbs Finder v2.0.2
 * Original Author: RedAlert
 * Original Author URL: https://twscripts.dev/
 * Original Author Contact: redalert_tw (Discord)
 * Original Approval: t13981993 (2020-05-27)
 * Original Mod: JawJaw
 *
 * FORK NOTICE:
 * This is a modified fork of the original approved Barbs Finder script.
 * Changes in this fork include Spanish UI, dynamic attack prefill of
 * 1 scout + the light cavalry needed for the scouted resources, and manual
 * read-only analysis of the player's
 * own attack reports to display the latest report date/time and scouted
 * resources for barbarian villages.
 * v2.2.0 adds non-overlapping distance ranges: 0-10, >10-20, ... >90-100.
 * v2.3.0 improves report reading: scans every report-list page, parses the
 * real #report_list rows, deduplicates report IDs, and distinguishes
 * confirmed zero resources from unavailable scouting data.
 * v2.4.0 calculates light cavalry dynamically from scouted resources using
 * 80 carrying capacity per light cavalry; 1 scout remains fixed.
 * v2.4.1 shows the latest attack as relative elapsed time (e.g. "hace 12 min").
 * v2.5.0 fixes report pagination by following Tribal Wars real "from=" offsets
 * (e.g. from=100, from=200) and discovering pagination links dynamically.
 * v2.5.1 adds an in-memory report cache shared across distance ranges.
 * Changing ranges reuses cached intel; Update Reports refreshes the
 * current range. Reset clears the cache. Filter-warning text was removed.
 * v2.5.2 prevents endless pagination when only one report page exists or
 * when the server ignores an invalid from= offset and repeats the same page.
 * v2.6.0 estimates resources generated since the latest report using the
 * scouted resource-building levels and the Classic 3 production factor,
 * displays wall level, changes distance ranges to five-field blocks, and
 * defaults attacks without a report to 1 scout + 10 light cavalry.
 *
 * IMPORTANT: The original approval applies to the original script/version.
 * This fork must not be assumed to be approved; submit this exact version
 * to the relevant Tribal Wars support/script review process before use.
 * The report analysis runs only after an explicit user click and this fork
 * never submits or confirms attacks automatically.
 */

/* Copyright (c) RedAlert
By uploading a user-generated mod (script) for use with Tribal Wars, you grant InnoGames a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, reproduce, distribute, publicly display, modify, and create derivative works of the mod. This license permits InnoGames to incorporate the mod into any aspect of the game and its related services, including promotional and commercial endeavors, without any requirement for compensation or attribution to you. InnoGames is entitled but not obligated to name you when exercising its rights. You represent and warrant that you have the legal right to grant this license and that the mod does not infringe upon any third-party rights. You are - with the exception of claims of infringement by third parties â€“ not liable for any usage of the mod by InnoGames. German law applies.
*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'barbsFinder',
        name: 'Barbs Finder',
        version: 'v2.6.0-ES-FORK',
        author: 'RedAlert',
        authorUrl: 'https://twscripts.dev/',
        helpLink:
            'https://forum.tribalwars.net/index.php?threads/barb-finder-with-filtering.285289/',
    },
    translations: {
        en_DK: {
            'Barbs Finder': 'Barbs Finder',
            'Min Points:': 'Min Points:',
            'Max Points:': 'Max Points:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbs found:',
            'Coordinates:': 'Coordinates:',
            'Error while fetching "village.txt"!':
                'Error while fetching "village.txt"!',
            Coords: 'Coords',
            Points: 'Points',
            'Wall level': 'Wall level',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!': 'No barbarian villages found!',
            'Current Village:': 'Current Village:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Help',
            'There was an error!': 'There was an error!',
            'Update Reports': 'Update reports',
            'Report pages:': 'Report pages:',
            'Latest report': 'Latest report',
            'Scouted resources': 'Scouted resources',
            'Estimated resources': 'Estimated resources',
            'Light cavalry': 'Light cavalry',
            Status: 'Status',
            'No report': 'No report',
            'Resources detected': 'Resources detected',
            'No resources': 'No resources',
            'No scout data': 'No scout data',
            'Filter barbarian villages first!': 'Filter barbarian villages first!',
            'Reading reports...': 'Reading reports...',
            'Reading report page': 'Reading report page',
            'Opening latest reports': 'Opening latest reports',
            'All report pages': 'All report pages',
            'Reports updated.': 'Reports updated.',
            'Could not read reports.': 'Could not read reports.',
            'Open report': 'Open report',
        },
        es_ES: {
            'Barbs Finder': 'Buscador de bárbaros',
            'Min Points:': 'Puntos mínimos:',
            'Max Points:': 'Puntos máximos:',
            'Radius:': 'Radio:',
            'Barbs found:': 'Bárbaros encontrados:',
            'Coordinates:': 'Coordenadas:',
            'Error while fetching "village.txt"!':
                '¡Error al obtener "village.txt"!',
            Coords: 'Coordenadas',
            Points: 'Puntos',
            'Wall level': 'Muralla',
            'Dist.': 'Dist.',
            Attack: 'Atacar',
            Filter: 'Filtrar',
            Reset: 'Restablecer',
            'No barbarian villages found!': '¡No se encontraron aldeas bárbaras!',
            'Current Village:': 'Aldea actual:',
            'Sequential Scout Script:': 'Script secuencial de exploración:',
            Help: 'Ayuda',
            'There was an error!': '¡Se produjo un error!',
            'Update Reports': 'Actualizar informes',
            'Report pages:': 'Páginas de informes:',
            'Latest report': 'Último ataque',
            'Scouted resources': 'Recursos espiados',
            'Estimated resources': 'Recursos estimados',
            'Light cavalry': 'Ligeras',
            Status: 'Estado',
            'No report': 'Sin informe',
            'Resources detected': 'Atacar: recursos detectados',
            'No resources': 'Sin recursos',
            'No scout data': 'Revisar: sin datos de espionaje',
            'Filter barbarian villages first!': '¡Primero filtra las aldeas bárbaras!',
            'Reading reports...': 'Leyendo informes...',
            'Reading report page': 'Leyendo página de informes',
            'Opening latest reports': 'Abriendo últimos informes',
            'All report pages': 'Todas las páginas',
            'Reports updated.': 'Informes actualizados.',
            'Could not read reports.': 'No se pudieron leer los informes.',
            'Open report': 'Ver informe',
        },
        sk_SK: {
            'Barbs Finder': 'HÄ¾adaÄ barbariek',
            'Min Points:': 'Min bodov:',
            'Max Points:': 'Max bodov:',
            'Radius:': 'VzdialenosÅ¥:',
            'Barbs found:': 'NÃ¡jdenÃ© barbarky:',
            'Coordinates:': 'SÃºradnice:',
            'Error while fetching "village.txt"!':
                'Chyba pri naÄÃ­tanÃ­ "village.txt"!',
            Coords: 'SÃºradnice',
            Points: 'Body',
            'Dist.': 'Vzdial.',
            Attack: 'Ãštok',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!':
                'Neboli nÃ¡jdenÃ© Å¾iadne dediny barbarov!',
            'Current Village:': 'SÃºÄasnÃ¡ dedina:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Pomoc',
            'There was an error!': 'There was an error!',
        },
        fr_FR: {
            'Barbs Finder': 'Recherche de Barbares',
            'Min Points:': 'Points Min.:',
            'Max Points:': 'Points Max.:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbs found:',
            'Coordinates:': 'Coordinates:',
            'Error while fetching "village.txt"!':
                'Error while fetching "village.txt"!',
            Coords: 'Coords',
            Points: 'Points',
            'Dist.': 'Dist.',
            Attack: 'Attaquer',
            Filter: 'Filtrer',
            Reset: 'RÃ©initialiser',
            'No barbarian villages found!': 'No barbarian villages found!',
            'Current Village:': 'Village Actuel:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Help',
            'There was an error!': 'There was an error!',
        },
        pt_PT: {
            'Barbs Finder': 'Procurador de BÃ¡rbaras',
            'Min Points:': 'Pontos mÃ­nimos:',
            'Max Points:': 'Pontos mÃ¡ximos:',
            'Radius:': 'Raio:',
            'Barbs found:': 'BÃ¡rbaras encontradas:',
            'Coordinates:': 'Coordenadas:',
            'Error while fetching "village.txt"!':
                'Erro ao procurar "village.txt"!',
            Coords: 'Coords',
            Points: 'Pontos',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filtro',
            Reset: 'Reset',
            'No barbarian villages found!': 'NÃ£o foram encontradas bÃ¡rbaras!',
            'Current Village:': 'Aldeia Atual:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Ajuda',
            'There was an error!': 'There was an error!',
        },
        pt_BR: {
            'Barbs Finder': 'Procurador de BÃ¡rbaras',
            'Min Points:': 'Pontos mÃ­nimos:',
            'Max Points:': 'Pontos mÃ¡ximos:',
            'Radius:': 'Campo:',
            'Barbs found:': 'BÃ¡rbaras encontradas:',
            'Coordinates:': 'Coordenadas:',
            'Error while fetching "village.txt"!':
                'Erro ao procurar "village.txt"!',
            Coords: 'Coords',
            Points: 'Pontos',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filtro',
            Reset: 'Reset',
            'No barbarian villages found!': 'NÃ£o foram encontradas bÃ¡rbaras!',
            'Current Village:': 'Aldeia Atual:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Ajuda',
            'There was an error!': 'There was an error!',
        },
        hu_HU: {
            'Barbs Finder': 'Barbi keresÅ‘',
            'Min Points:': 'Min pontszÃ¡m:',
            'Max Points:': 'Max pontszÃ¡m:',
            'Radius:': 'HatÃ³kÃ¶r:',
            'Barbs found:': 'MegtalÃ¡lt barbik:',
            'Coordinates:': 'KoordinÃ¡tÃ¡k:',
            'Error while fetching "village.txt"!':
                'Hiba a "village.txt" beolvasÃ¡sa sorÃ¡n!',
            Coords: 'KoordinÃ¡tÃ¡k',
            Points: 'PontszÃ¡m',
            'Dist.': 'TÃ¡volsÃ¡g',
            Attack: 'TÃ¡madÃ¡s',
            Filter: 'SzÅ±rÃ©s',
            Reset: 'Reset',
            'No barbarian villages found!': 'Nem talÃ¡ltam barbit!',
            'Current Village:': 'Jelenlegi falu:',
            'Sequential Scout Script:': 'Teljes script a kikÃ©mlelÃ©shez:',
            Help: 'SegÃ­tsÃ©g',
            'There was an error!': 'There was an error!',
        },
        hr_HR: {
            'Barbs Finder': 'Barbari Koordinati',
            'Min Points:': 'Minimalno Poena:',
            'Max Points:': 'Maksimalno Poena:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbara pronaÄ‘eno:',
            'Coordinates:': 'Koordinati:',
            'Error while fetching "village.txt"!':
                'GreÅ¡ka u dohvaÄ‡anju podataka "village.txt"!',
            Coords: 'Koordinati',
            Points: 'Poeni',
            'Dist.': 'Distanca.',
            Attack: 'Napad',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!': 'Nisu pronaÄ‘ena barbarska sela!',
            'Current Village:': 'Trenutno Selo:',
            'Sequential Scout Script:': 'Sekvencijalna izviÄ‘aÄka skripta:',
            Help: 'PomoÄ‡',
            'There was an error!': 'There was an error!',
        },
        pl_PL: {
            'Barbs Finder': 'Znajdz wioski opuszczone',
            'Min Points:': 'Minimalna iloÅ›Ä‡ punktÃ³w:',
            'Max Points:': 'Maksymalna iloÅ›Ä‡ punktÃ³w:',
            'Radius:': 'PromieÅ„:',
            'Barbs found:': 'Znaleziono wiosek:',
            'Coordinates:': 'Kordynaty:',
            'Error while fetching "village.txt"!':
                'BÅ‚Ä…d podczas wyszukiwania plikuâ€ž village.txt â€!',
            Coords: 'Koordy',
            Points: 'Punkty',
            'Dist.': 'OdlegÅ‚oÅ›Ä‡',
            Attack: 'Atak',
            Filter: 'ZnajdÅº',
            Reset: 'Reset',
            'No barbarian villages found!':
                'Nie znaleziono wiosek barbarzyÅ„skich',
            'Current Village:': 'Obecna wioska:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Pomoc',
            'There was an error!': 'There was an error!',
        },
        sv_SE: {
            'Barbs Finder': 'Hitta Barbarby',
            'Min Points:': 'Min PoÃ¤ng:',
            'Max Points:': 'Max PoÃ¤ng:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbarby hittade:',
            'Coordinates:': 'Koordinater:',
            'Error while fetching "village.txt"!':
                'Fel vid hÃ¤mtning av "village.txtâ€!',
            Coords: 'Kords',
            Points: 'PoÃ¤ng',
            'Dist.': 'AvstÃ¥nd',
            Attack: 'Attackera',
            Filter: 'Filter',
            Reset: 'Ã…terstÃ¤ll',
            'No barbarian villages found!': 'Inga barbarbyar hittade!',
            'Current Village:': 'Nuvarande by:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'HjÃ¤lp',
            'There was an error!': 'There was an error!',
        },
        tr_TR: {
            'Barbs Finder': 'Barbar Bulucu',
            'Min Points:': 'Minimum Puan:',
            'Max Points:': 'Maksimum Puan:',
            'Radius:': 'Alan:',
            'Barbs found:': 'Bulunan barbarlar:',
            'Coordinates:': 'Koordinatlar:',
            'Error while fetching "village.txt"!':
                'Arama hatasÄ± oluÅŸtu "village.txt"!',
            Coords: 'Koordinatlar',
            Points: 'Puanlar',
            'Dist.': 'UzaklÄ±k',
            Attack: 'SaldÄ±r',
            Filter: 'Filtre',
            Reset: 'Reset',
            'No barbarian villages found!': 'Barbar bulunamadÄ±!',
            'Current Village:': 'GeÃ§erli KÃ¶y',
            'Sequential Scout Script:': 'SÄ±ralÄ± Casus Scripti',
            Help: 'YardÄ±m',
            'There was an error!': 'There was an error!',
        },
        cs_CZ: {
            'Barbs Finder': 'Barbs Finder',
            'Min Points:': 'Min body:',
            'Max Points:': 'Max body:',
            'Radius:': 'Radius:',
            'Barbs found:': 'NalezenÃ© barbarskÃ© vesnice:',
            'Coordinates:': 'SouÅ™adnice:',
            'Error while fetching "village.txt"!':
                'Error while fetching "village.txt"!',
            Coords: 'SouÅ™adnice',
            Points: 'Body',
            'Dist.': 'VzdÃ¡lenost',
            Attack: 'Ãštok',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!':
                'Å½Ã¡dnÃ© barbarskÃ© vesnice nenalezeny!',
            'Current Village:': 'AktuÃ¡lnÃ­ vesnice:',
            'Sequential Scout Script:': 'Skript na Å¡pehy:',
            Help: 'Pomoc',
            'There was an error!': 'There was an error!',
        },
    },
    allowedMarkets: [],
    allowedScreens: [],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

window.twSDK = {
    // variables
    scriptData: {},
    translations: {},
    allowedMarkets: [],
    allowedScreens: [],
    allowedModes: [],
    enableCountApi: true,
    isDebug: false,
    isMobile: jQuery('#mobileHeader').length > 0,
    delayBetweenRequests: 200,
    // helper variables
    market: game_data.market,
    units: game_data.units,
    village: game_data.village,
    buildings: game_data.village.buildings,
    sitterId: game_data.player.sitter > 0 ? `&t=${game_data.player.id}` : '',
    coordsRegex: /\d{1,3}\|\d{1,3}/g,
    dateTimeMatch:
        /(?:[A-Z][a-z]{2}\s+\d{1,2},\s*\d{0,4}\s+|today\s+at\s+|tomorrow\s+at\s+)\d{1,2}:\d{2}:\d{2}:?\.?\d{0,3}/,
    worldInfoInterface: '/interface.php?func=get_config',
    unitInfoInterface: '/interface.php?func=get_unit_info',
    buildingInfoInterface: '/interface.php?func=get_building_info',
    worldDataVillages: '/map/village.txt',
    worldDataPlayers: '/map/player.txt',
    worldDataTribes: '/map/ally.txt',
    worldDataConquests: '/map/conquer_extended.txt',
    // game constants
    buildingsList: [
        'main',
        'barracks',
        'stable',
        'garage',
        'church',
        'church_f',
        'watchtower',
        'snob',
        'smith',
        'place',
        'statue',
        'market',
        'wood',
        'stone',
        'iron',
        'farm',
        'storage',
        'hide',
        'wall',
    ],
    // https://help.tribalwars.net/wiki/Points
    buildingPoints: {
        main: [
            10, 2, 2, 3, 4, 4, 5, 6, 7, 9, 10, 12, 15, 18, 21, 26, 31, 37, 44,
            53, 64, 77, 92, 110, 133, 159, 191, 229, 274, 330,
        ],
        barracks: [
            16, 3, 4, 5, 5, 7, 8, 9, 12, 14, 16, 20, 24, 28, 34, 42, 49, 59, 71,
            85, 102, 123, 147, 177, 212,
        ],
        stable: [
            20, 4, 5, 6, 6, 9, 10, 12, 14, 17, 21, 25, 29, 36, 43, 51, 62, 74,
            88, 107,
        ],
        garage: [24, 5, 6, 6, 9, 10, 12, 14, 17, 21, 25, 29, 36, 43, 51],
        chuch: [10, 2, 2],
        church_f: [10],
        watchtower: [
            42, 8, 10, 13, 14, 18, 20, 25, 31, 36, 43, 52, 62, 75, 90, 108, 130,
            155, 186, 224,
        ],
        snob: [512],
        smith: [
            19, 4, 4, 6, 6, 8, 10, 11, 14, 16, 20, 23, 28, 34, 41, 49, 58, 71,
            84, 101,
        ],
        place: [0],
        statue: [24],
        market: [
            10, 2, 2, 3, 4, 4, 5, 6, 7, 9, 10, 12, 15, 18, 21, 26, 31, 37, 44,
            53, 64, 77, 92, 110, 133,
        ],
        wood: [
            6, 1, 2, 1, 2, 3, 3, 3, 5, 5, 6, 8, 8, 11, 13, 15, 19, 22, 27, 32,
            38, 46, 55, 66, 80, 95, 115, 137, 165, 198,
        ],
        stone: [
            6, 1, 2, 1, 2, 3, 3, 3, 5, 5, 6, 8, 8, 11, 13, 15, 19, 22, 27, 32,
            38, 46, 55, 66, 80, 95, 115, 137, 165, 198,
        ],
        iron: [
            6, 1, 2, 1, 2, 3, 3, 3, 5, 5, 6, 8, 8, 11, 13, 15, 19, 22, 27, 32,
            38, 46, 55, 66, 80, 95, 115, 137, 165, 198,
        ],
        farm: [
            5, 1, 1, 2, 1, 2, 3, 3, 3, 5, 5, 6, 8, 8, 11, 13, 15, 19, 22, 27,
            32, 38, 46, 55, 66, 80, 95, 115, 137, 165,
        ],
        storage: [
            6, 1, 2, 1, 2, 3, 3, 3, 5, 5, 6, 8, 8, 11, 13, 15, 19, 22, 27, 32,
            38, 46, 55, 66, 80, 95, 115, 137, 165, 198,
        ],
        hide: [5, 1, 1, 2, 1, 2, 3, 3, 3, 5],
        wall: [
            8, 2, 2, 2, 3, 3, 4, 5, 5, 7, 9, 9, 12, 15, 17, 20, 25, 29, 36, 43,
        ],
    },
    unitsFarmSpace: {
        spear: 1,
        sword: 1,
        axe: 1,
        archer: 1,
        spy: 2,
        light: 4,
        marcher: 5,
        heavy: 6,
        ram: 5,
        catapult: 8,
        knight: 10,
        snob: 100,
    },
    // https://help.tribalwars.net/wiki/Timber_camp
    // https://help.tribalwars.net/wiki/Clay_pit
    // https://help.tribalwars.net/wiki/Iron_mine
    resPerHour: {
        0: 2,
        1: 30,
        2: 35,
        3: 41,
        4: 47,
        5: 55,
        6: 64,
        7: 74,
        8: 86,
        9: 100,
        10: 117,
        11: 136,
        12: 158,
        13: 184,
        14: 214,
        15: 249,
        16: 289,
        17: 337,
        18: 391,
        19: 455,
        20: 530,
        21: 616,
        22: 717,
        23: 833,
        24: 969,
        25: 1127,
        26: 1311,
        27: 1525,
        28: 1774,
        29: 2063,
        30: 2400,
    },
    watchtowerLevels: [
        1.1, 1.3, 1.5, 1.7, 2, 2.3, 2.6, 3, 3.4, 3.9, 4.4, 5.1, 5.8, 6.7, 7.6,
        8.7, 10, 11.5, 13.1, 15,
    ],

    // internal methods
    _initDebug: function () {
        const scriptInfo = this.scriptInfo();
        console.debug(`${scriptInfo} It works ðŸš€!`);
        console.debug(`${scriptInfo} HELP:`, this.scriptData.helpLink);
        if (this.isDebug) {
            console.debug(`${scriptInfo} Market:`, game_data.market);
            console.debug(`${scriptInfo} World:`, game_data.world);
            console.debug(`${scriptInfo} Screen:`, game_data.screen);
            console.debug(
                `${scriptInfo} Game Version:`,
                game_data.majorVersion
            );
            console.debug(`${scriptInfo} Game Build:`, game_data.version);
            console.debug(`${scriptInfo} Locale:`, game_data.locale);
            console.debug(
                `${scriptInfo} PA:`,
                game_data.features.Premium.active
            );
            console.debug(
                `${scriptInfo} LA:`,
                game_data.features.FarmAssistent.active
            );
            console.debug(
                `${scriptInfo} AM:`,
                game_data.features.AccountManager.active
            );
        }
    },

    // public methods
    addGlobalStyle: function () {
        return `
            /* Table Styling */
            .ra-table-container { overflow-y: auto; overflow-x: hidden; height: auto; max-height: 400px; }
            .ra-table th { font-size: 14px; }
            .ra-table th label { margin: 0; padding: 0; }
            .ra-table th,
            .ra-table td { padding: 5px; text-align: center; }
            .ra-table td a { word-break: break-all; }
            .ra-table a:focus { color: blue; }
            .ra-table a.btn:focus { color: #fff; }
            .ra-table tr:nth-of-type(2n) td { background-color: #f0e2be }
            .ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }

            .ra-table-v2 th,
            .ra-table-v2 td { text-align: left; }

            .ra-table-v3 { border: 2px solid #bd9c5a; }
            .ra-table-v3 th,
            .ra-table-v3 td { border-collapse: separate; border: 1px solid #bd9c5a; text-align: left; }

            /* Inputs */
            .ra-textarea { width: 100%; height: 80px; resize: none; }

            /* Popup */
            .ra-popup-content { width: 360px; }
            .ra-popup-content * { box-sizing: border-box; }
            .ra-popup-content input[type="text"] { padding: 3px; width: 100%; }
            .ra-popup-content .btn-confirm-yes { padding: 3px !important; }
            .ra-popup-content label { display: block; margin-bottom: 5px; font-weight: 600; }
            .ra-popup-content > div { margin-bottom: 15px; }
            .ra-popup-content > div:last-child { margin-bottom: 0 !important; }
            .ra-popup-content textarea { width: 100%; height: 100px; resize: none; }

            /* Elements */
            .ra-details { display: block; margin-bottom: 8px; border: 1px solid #603000; padding: 8px; border-radius: 4px; }
            .ra-details summary { font-weight: 600; cursor: pointer; }
            .ra-details p { margin: 10px 0 0 0; padding: 0; }

            /* Helpers */
            .ra-pa5 { padding: 5px !important; }
            .ra-mt15 { margin-top: 15px !important; }
            .ra-mb10 { margin-bottom: 10px !important; }
            .ra-mb15 { margin-bottom: 15px !important; }
            .ra-tal { text-align: left !important; }
            .ra-tac { text-align: center !important; }
            .ra-tar { text-align: right !important; }

            /* RESPONSIVE */
            @media (max-width: 480px) {
                .ra-fixed-widget {
                    position: relative !important;
                    top: 0;
                    left: 0;
                    display: block;
                    width: auto;
                    height: auto;
                    z-index: 1;
                }

                .ra-box-widget {
                    position: relative;
                    display: block;
                    box-sizing: border-box;
                    width: 97%;
                    height: auto;
                    margin: 10px auto;
                }

                .ra-table {
                    border-collapse: collapse !important;
                }

                .custom-close-button { display: none; }
                .ra-fixed-widget h3 { margin-bottom: 15px; }
                .ra-popup-content { width: 100%; }
            }
        `;
    },
    addScriptToQuickbar: function (name, script, callback) {
        let scriptData = `hotkey=&name=${name}&href=${encodeURI(script)}`;
        let action =
            '/game.php?screen=settings&mode=quickbar_edit&action=quickbar_edit&';

        jQuery.ajax({
            url: action,
            type: 'POST',
            data: scriptData + `&h=${csrf_token}`,
            success: function () {
                if (typeof callback === 'function') {
                    callback();
                }
            },
        });
    },
    arraysIntersection: function () {
        var result = [];
        var lists;

        if (arguments.length === 1) {
            lists = arguments[0];
        } else {
            lists = arguments;
        }

        for (var i = 0; i < lists.length; i++) {
            var currentList = lists[i];
            for (var y = 0; y < currentList.length; y++) {
                var currentValue = currentList[y];
                if (result.indexOf(currentValue) === -1) {
                    var existsInAll = true;
                    for (var x = 0; x < lists.length; x++) {
                        if (lists[x].indexOf(currentValue) === -1) {
                            existsInAll = false;
                            break;
                        }
                    }
                    if (existsInAll) {
                        result.push(currentValue);
                    }
                }
            }
        }
        return result;
    },
    buildUnitsPicker: function (
        selectedUnits = [],
        unitsToIgnore,
        type = 'checkbox'
    ) {
        let unitsTable = ``;

        let thUnits = ``;
        let tableRow = ``;

        game_data.units.forEach((unit) => {
            if (!unitsToIgnore.includes(unit)) {
                let checked = '';
                if (selectedUnits.includes(unit)) {
                    checked = `checked`;
                }

                thUnits += `
                    <th class="ra-tac">
                        <label for="unit_${unit}">
                            <img src="/graphic/unit/unit_${unit}.png">
                        </label>
                    </th>
                `;

                tableRow += `
                    <td class="ra-tac">
                        <input name="ra_chosen_units" type="${type}" ${checked} id="unit_${unit}" class="ra-unit-selector" value="${unit}" />
                    </td>
                `;
            }
        });

        unitsTable = `
            <table class="ra-table ra-table-v2" width="100%" id="raUnitSelector">
                <thead>
                    <tr>
                        ${thUnits}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        ${tableRow}
                    </tr>
                </tbody>
            </table>
        `;

        return unitsTable;
    },
    calculateCoinsNeededForNthNoble: function (noble) {
        return (noble * noble + noble) / 2;
    },
    calculateDistanceFromCurrentVillage: function (coord) {
        const x1 = game_data.village.x;
        const y1 = game_data.village.y;
        const [x2, y2] = coord.split('|');
        const deltaX = Math.abs(x1 - x2);
        const deltaY = Math.abs(y1 - y2);
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    },
    calculateDistance: function (from, to) {
        const [x1, y1] = from.split('|');
        const [x2, y2] = to.split('|');
        const deltaX = Math.abs(x1 - x2);
        const deltaY = Math.abs(y1 - y2);
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    },
    calculatePercentages: function (amount, total) {
        if (amount === undefined) amount = 0;
        return parseFloat((amount / total) * 100).toFixed(2);
    },
    calculateTimesByDistance: async function (distance) {
        const _self = this;

        const times = [];
        const travelTimes = [];

        const unitInfo = await _self.getWorldUnitInfo();
        const worldConfig = await _self.getWorldConfig();

        for (let [key, value] of Object.entries(unitInfo.config)) {
            times.push(value.speed);
        }

        const { speed, unit_speed } = worldConfig.config;

        times.forEach((time) => {
            let travelTime = Math.round(
                (distance * time * 60) / speed / unit_speed
            );
            travelTime = _self.secondsToHms(travelTime);
            travelTimes.push(travelTime);
        });

        return travelTimes;
    },
    checkValidLocation: function (type) {
        switch (type) {
            case 'screen':
                return this.allowedScreens.includes(
                    this.getParameterByName('screen')
                );
            case 'mode':
                return this.allowedModes.includes(
                    this.getParameterByName('mode')
                );
            default:
                return false;
        }
    },
    checkValidMarket: function () {
        if (this.market === 'yy') return true;
        return this.allowedMarkets.includes(this.market);
    },
    cleanString: function (string) {
        try {
            return decodeURIComponent(string).replace(/\+/g, ' ');
        } catch (error) {
            console.error(error, string);
            return string;
        }
    },
    copyToClipboard: function (string) {
        navigator.clipboard.writeText(string);
    },
    createUUID: function () {
        return crypto.randomUUID();
    },
    csvToArray: function (strData, strDelimiter = ',') {
        var objPattern = new RegExp(
            '(\\' +
                strDelimiter +
                '|\\r?\\n|\\r|^)' +
                '(?:"([^"]*(?:""[^"]*)*)"|' +
                '([^"\\' +
                strDelimiter +
                '\\r\\n]*))',
            'gi'
        );
        var arrData = [[]];
        var arrMatches = null;
        while ((arrMatches = objPattern.exec(strData))) {
            var strMatchedDelimiter = arrMatches[1];
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ) {
                arrData.push([]);
            }
            var strMatchedValue;

            if (arrMatches[2]) {
                strMatchedValue = arrMatches[2].replace(
                    new RegExp('""', 'g'),
                    '"'
                );
            } else {
                strMatchedValue = arrMatches[3];
            }
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        return arrData;
    },
    decryptAccountManangerTemplate: function (exportedTemplate) {
        const buildings = [];

        const binaryString = atob(exportedTemplate);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const payloadLength = bytes[0] + bytes[1] * 256;
        if (payloadLength <= bytes.length - 2) {
            const payload = bytes.slice(2, 2 + payloadLength);
            for (let i = 0; i < payload.length; i += 2) {
                const buildingId = payload[i];
                const buildingLevel = payload[i + 1];
                if (this.buildingsList[buildingId]) {
                    buildings.push({
                        id: this.buildingsList[buildingId],
                        upgrade: `+${buildingLevel}`,
                    });
                }
            }

            return buildings;
        }
    },
    filterVillagesByPlayerIds: function (playerIds, villages) {
        const playerVillages = [];
        villages.forEach((village) => {
            if (playerIds.includes(parseInt(village[4]))) {
                const coordinate = village[2] + '|' + village[3];
                playerVillages.push(coordinate);
            }
        });
        return playerVillages;
    },
    formatAsNumber: function (number) {
        return parseInt(number).toLocaleString('de');
    },
    formatDateTime: function (dateTime) {
        dateTime = new Date(dateTime);
        return (
            this.zeroPad(dateTime.getDate(), 2) +
            '/' +
            this.zeroPad(dateTime.getMonth() + 1, 2) +
            '/' +
            dateTime.getFullYear() +
            ' ' +
            this.zeroPad(dateTime.getHours(), 2) +
            ':' +
            this.zeroPad(dateTime.getMinutes(), 2) +
            ':' +
            this.zeroPad(dateTime.getSeconds(), 2)
        );
    },
    frequencyCounter: function (array) {
        return array.reduce(function (acc, curr) {
            if (typeof acc[curr] == 'undefined') {
                acc[curr] = 1;
            } else {
                acc[curr] += 1;
            }
            return acc;
        }, {});
    },
    generateRandomCoordinates: function () {
        const x = Math.floor(Math.random() * 1000);
        const y = Math.floor(Math.random() * 1000);
        return `${x}|${y}`;
    },
    getAll: function (
        urls, // array of URLs
        onLoad, // called when any URL is loaded, params (index, data)
        onDone, // called when all URLs successfully loaded, no params
        onError // called when a URL load fails or if onLoad throws an exception, params (error)
    ) {
        var numDone = 0;
        var lastRequestTime = 0;
        var minWaitTime = this.delayBetweenRequests; // ms between requests
        loadNext();
        function loadNext() {
            if (numDone == urls.length) {
                onDone();
                return;
            }

            let now = Date.now();
            let timeElapsed = now - lastRequestTime;
            if (timeElapsed < minWaitTime) {
                let timeRemaining = minWaitTime - timeElapsed;
                setTimeout(loadNext, timeRemaining);
                return;
            }
            lastRequestTime = now;
            jQuery
                .get(urls[numDone])
                .done((data) => {
                    try {
                        onLoad(numDone, data);
                        ++numDone;
                        loadNext();
                    } catch (e) {
                        onError(e);
                    }
                })
                .fail((xhr) => {
                    onError(xhr);
                });
        }
    },
    getBuildingsInfo: async function () {
        const TIME_INTERVAL = 60 * 60 * 1000 * 24 * 365; // fetch config only once since they don't change
        const LAST_UPDATED_TIME =
            localStorage.getItem('buildings_info_last_updated') ?? 0;
        let buildingsInfo = [];

        if (LAST_UPDATED_TIME !== null) {
            if (Date.parse(new Date()) >= LAST_UPDATED_TIME + TIME_INTERVAL) {
                const response = await jQuery.ajax({
                    url: this.buildingInfoInterface,
                });
                buildingsInfo = this.xml2json(jQuery(response));
                localStorage.setItem(
                    'buildings_info',
                    JSON.stringify(buildingsInfo)
                );
                localStorage.setItem(
                    'buildings_info_last_updated',
                    Date.parse(new Date())
                );
            } else {
                buildingsInfo = JSON.parse(
                    localStorage.getItem('buildings_info')
                );
            }
        } else {
            const response = await jQuery.ajax({
                url: this.buildingInfoInterface,
            });
            buildingsInfo = this.xml2json(jQuery(response));
            localStorage.setItem('buildings_info', JSON.stringify(unitInfo));
            localStorage.setItem(
                'buildings_info_last_updated',
                Date.parse(new Date())
            );
        }

        return buildingsInfo;
    },
    getContinentByCoord: function (coord) {
        let [x, y] = Array.from(coord.split('|')).map((e) => parseInt(e));
        for (let i = 0; i < 1000; i += 100) {
            //x axes
            for (let j = 0; j < 1000; j += 100) {
                //y axes
                if (i >= x && x < i + 100 && j >= y && y < j + 100) {
                    let nr_continent =
                        parseInt(y / 100) + '' + parseInt(x / 100);
                    return nr_continent;
                }
            }
        }
    },
    getContinentsFromCoordinates: function (coordinates) {
        let continents = [];

        coordinates.forEach((coord) => {
            const continent = twSDK.getContinentByCoord(coord);
            continents.push(continent);
        });

        return [...new Set(continents)];
    },
    getCoordFromString: function (string) {
        if (!string) return [];
        return string.match(this.coordsRegex)[0];
    },
    getContinentSectorField: function (coordinate) {
        const continent = this.getContinentByCoord(coordinate);
        let [coordX, coordY] = coordinate.split('|');

        let tempX = Number(coordX);
        let tempY = Number(coordY);

        //==== sector ====
        if (tempX >= 100) tempX = Number(String(coordX).substring(1));
        if (tempY >= 100) tempY = Number(String(coordY).substring(1));

        let xPos = Math.floor(tempX / 5);
        let yPos = Math.floor(tempY / 5);
        let sector = yPos * 20 + xPos;

        //==== field ====
        if (tempX >= 10) tempX = Number(String(tempX).substring(1));
        if (tempY >= 10) tempY = Number(String(tempY).substring(1));

        if (tempX >= 5) tempX = tempX - 5;
        if (tempY >= 5) tempY = tempY - 5;
        let field = tempY * 5 + tempX;

        let name = continent + ':' + sector + ':' + field;

        return name;
    },
    getDestinationCoordinates: function (config, tribes, players, villages) {
        const {
            playersInput,
            tribesInput,
            continents,
            minCoord,
            maxCoord,
            distCenter,
            center,
            excludedPlayers,
            enable20To1Limit,
            minPoints,
            maxPoints,
            selectiveRandomConfig,
        } = config;

        // get target coordinates
        const chosenPlayers = playersInput.split(',');
        const chosenTribes = tribesInput.split(',');

        const chosenPlayerIds = twSDK.getEntityIdsByArrayIndex(
            chosenPlayers,
            players,
            1
        );
        const chosenTribeIds = twSDK.getEntityIdsByArrayIndex(
            chosenTribes,
            tribes,
            2
        );

        const tribePlayers = twSDK.getTribeMembersById(chosenTribeIds, players);

        const mergedPlayersList = [...tribePlayers, ...chosenPlayerIds];
        let uniquePlayersList = [...new Set(mergedPlayersList)];

        const chosenExcludedPlayers = excludedPlayers.split(',');
        if (chosenExcludedPlayers.length > 0) {
            const excludedPlayersIds = twSDK.getEntityIdsByArrayIndex(
                chosenExcludedPlayers,
                players,
                1
            );
            excludedPlayersIds.forEach((item) => {
                uniquePlayersList = uniquePlayersList.filter(
                    (player) => player !== item
                );
            });
        }

        // filter by 20:1 rule
        if (enable20To1Limit) {
            let uniquePlayersListArray = [];
            uniquePlayersList.forEach((playerId) => {
                players.forEach((player) => {
                    if (parseInt(player[0]) === playerId) {
                        uniquePlayersListArray.push(player);
                    }
                });
            });

            const playersNotBiggerThen20Times = uniquePlayersListArray.filter(
                (player) => {
                    return (
                        parseInt(player[4]) <=
                        parseInt(game_data.player.points) * 20
                    );
                }
            );

            uniquePlayersList = playersNotBiggerThen20Times.map((player) =>
                parseInt(player[0])
            );
        }

        let coordinatesArray = twSDK.filterVillagesByPlayerIds(
            uniquePlayersList,
            villages
        );

        // filter by min and max village points
        if (minPoints || maxPoints) {
            let filteredCoordinatesArray = [];

            coordinatesArray.forEach((coordinate) => {
                villages.forEach((village) => {
                    const villageCoordinate = village[2] + '|' + village[3];
                    if (villageCoordinate === coordinate) {
                        filteredCoordinatesArray.push(village);
                    }
                });
            });

            filteredCoordinatesArray = filteredCoordinatesArray.filter(
                (village) => {
                    const villagePoints = parseInt(village[5]);
                    const minPointsNumber = parseInt(minPoints) || 26;
                    const maxPointsNumber = parseInt(maxPoints) || 12124;
                    if (
                        villagePoints > minPointsNumber &&
                        villagePoints < maxPointsNumber
                    ) {
                        return village;
                    }
                }
            );

            coordinatesArray = filteredCoordinatesArray.map(
                (village) => village[2] + '|' + village[3]
            );
        }

        // filter coordinates by continent
        if (continents.length) {
            let chosenContinentsArray = continents.split(',');
            chosenContinentsArray = chosenContinentsArray.map((item) =>
                item.trim()
            );

            const availableContinents =
                twSDK.getContinentsFromCoordinates(coordinatesArray);
            const filteredVillagesByContinent =
                twSDK.getFilteredVillagesByContinent(
                    coordinatesArray,
                    availableContinents
                );

            const isUserInputValid = chosenContinentsArray.every((item) =>
                availableContinents.includes(item)
            );

            if (isUserInputValid) {
                coordinatesArray = chosenContinentsArray
                    .map((continent) => {
                        if (continent.length && $.isNumeric(continent)) {
                            return [...filteredVillagesByContinent[continent]];
                        } else {
                            return;
                        }
                    })
                    .flat();
            } else {
                return [];
            }
        }

        // filter coordinates by a bounding box of coordinates
        if (minCoord.length && maxCoord.length) {
            const raMinCoordCheck = minCoord.match(twSDK.coordsRegex);
            const raMaxCoordCheck = maxCoord.match(twSDK.coordsRegex);

            if (raMinCoordCheck !== null && raMaxCoordCheck !== null) {
                const [minX, minY] = raMinCoordCheck[0].split('|');
                const [maxX, maxY] = raMaxCoordCheck[0].split('|');

                coordinatesArray = [...coordinatesArray].filter(
                    (coordinate) => {
                        const [x, y] = coordinate.split('|');
                        if (minX <= x && x <= maxX && minY <= y && y <= maxY) {
                            return coordinate;
                        }
                    }
                );
            } else {
                return [];
            }
        }

        // filter by radius
        if (distCenter.length && center.length) {
            if (!$.isNumeric(distCenter)) distCenter = 0;
            const raCenterCheck = center.match(twSDK.coordsRegex);

            if (distCenter !== 0 && raCenterCheck !== null) {
                let coordinatesArrayWithDistance = [];
                coordinatesArray.forEach((coordinate) => {
                    const distance = twSDK.calculateDistance(
                        raCenterCheck[0],
                        coordinate
                    );
                    coordinatesArrayWithDistance.push({
                        coord: coordinate,
                        distance: distance,
                    });
                });

                coordinatesArrayWithDistance =
                    coordinatesArrayWithDistance.filter((item) => {
                        return (
                            parseFloat(item.distance) <= parseFloat(distCenter)
                        );
                    });

                coordinatesArray = coordinatesArrayWithDistance.map(
                    (item) => item.coord
                );
            } else {
                return [];
            }
        }

        // apply multiplier
        if (selectiveRandomConfig) {
            const selectiveRandomizer = selectiveRandomConfig.split(';');

            const makeRepeated = (arr, repeats) =>
                Array.from({ length: repeats }, () => arr).flat();
            const multipliedCoordinatesArray = [];

            selectiveRandomizer.forEach((item) => {
                const [playerName, distribution] = item.split(':');
                if (distribution > 1) {
                    players.forEach((player) => {
                        if (
                            twSDK.cleanString(player[1]) ===
                            twSDK.cleanString(playerName)
                        ) {
                            let playerVillages =
                                twSDK.filterVillagesByPlayerIds(
                                    [parseInt(player[0])],
                                    villages
                                );
                            const flattenedPlayerVillagesArray = makeRepeated(
                                playerVillages,
                                distribution
                            );
                            multipliedCoordinatesArray.push(
                                flattenedPlayerVillagesArray
                            );
                        }
                    });
                }
            });

            coordinatesArray.push(...multipliedCoordinatesArray.flat());
        }

        return coordinatesArray;
    },
    getEntityIdsByArrayIndex: function (chosenItems, items, index) {
        const itemIds = [];
        chosenItems.forEach((chosenItem) => {
            items.forEach((item) => {
                if (
                    twSDK.cleanString(item[index]) ===
                    twSDK.cleanString(chosenItem)
                ) {
                    return itemIds.push(parseInt(item[0]));
                }
            });
        });
        return itemIds;
    },
    getFilteredVillagesByContinent: function (
        playerVillagesCoords,
        continents
    ) {
        let coords = [...playerVillagesCoords];
        let filteredVillagesByContinent = [];

        coords.forEach((coord) => {
            continents.forEach((continent) => {
                let currentVillageContinent = twSDK.getContinentByCoord(coord);
                if (currentVillageContinent === continent) {
                    filteredVillagesByContinent.push({
                        continent: continent,
                        coords: coord,
                    });
                }
            });
        });

        return twSDK.groupArrayByProperty(
            filteredVillagesByContinent,
            'continent',
            'coords'
        );
    },
    getGameFeatures: function () {
        const { Premium, FarmAssistent, AccountManager } = game_data.features;
        const isPA = Premium.active;
        const isLA = FarmAssistent.active;
        const isAM = AccountManager.active;
        return { isPA, isLA, isAM };
    },
    getKeyByValue: function (object, value) {
        return Object.keys(object).find((key) => object[key] === value);
    },
    getLandingTimeFromArrivesIn: function (arrivesIn) {
        const currentServerTime = twSDK.getServerDateTimeObject();
        const [hours, minutes, seconds] = arrivesIn.split(':');
        const totalSeconds = +hours * 3600 + +minutes * 60 + +seconds;
        const arrivalDateTime = new Date(
            currentServerTime.getTime() + totalSeconds * 1000
        );
        return arrivalDateTime;
    },
    getLastCoordFromString: function (string) {
        if (!string) return [];
        const regex = this.coordsRegex;
        let match;
        let lastMatch;
        while ((match = regex.exec(string)) !== null) {
            lastMatch = match;
        }
        return lastMatch ? lastMatch[0] : [];
    },
    getPagesToFetch: function () {
        let list_pages = [];

        const currentPage = twSDK.getParameterByName('page');
        if (currentPage == '-1') return [];

        if (
            document
                .getElementsByClassName('vis')[1]
                .getElementsByTagName('select').length > 0
        ) {
            Array.from(
                document
                    .getElementsByClassName('vis')[1]
                    .getElementsByTagName('select')[0]
            ).forEach(function (item) {
                list_pages.push(item.value);
            });
            list_pages.pop();
        } else if (
            document.getElementsByClassName('paged-nav-item').length > 0
        ) {
            let nr = 0;
            Array.from(
                document.getElementsByClassName('paged-nav-item')
            ).forEach(function (item) {
                let current = item.href;
                current = current.split('page=')[0] + 'page=' + nr;
                nr++;
                list_pages.push(current);
            });
        } else {
            let current_link = window.location.href;
            list_pages.push(current_link);
        }
        list_pages.shift();

        return list_pages;
    },
    getParameterByName: function (name, url = window.location.href) {
        return new URL(url).searchParams.get(name);
    },
    getRelativeImagePath: function (url) {
        const urlParts = url.split('/');
        return `/${urlParts[5]}/${urlParts[6]}/${urlParts[7]}`;
    },
    getServerDateTimeObject: function () {
        const formattedTime = this.getServerDateTime();
        return new Date(formattedTime);
    },
    getServerDateTime: function () {
        const serverTime = jQuery('#serverTime').text();
        const serverDate = jQuery('#serverDate').text();
        const [day, month, year] = serverDate.split('/');
        const serverTimeFormatted =
            year + '-' + month + '-' + day + ' ' + serverTime;
        return serverTimeFormatted;
    },
    getTimeFromString: function (timeLand) {
        let dateLand = '';
        let serverDate = document
            .getElementById('serverDate')
            .innerText.split('/');

        let TIME_PATTERNS = {
            today: 'today at %s',
            tomorrow: 'tomorrow at %s',
            later: 'on %1 at %2',
        };

        if (window.lang) {
            TIME_PATTERNS = {
                today: window.lang['aea2b0aa9ae1534226518faaefffdaad'],
                tomorrow: window.lang['57d28d1b211fddbb7a499ead5bf23079'],
                later: window.lang['0cb274c906d622fa8ce524bcfbb7552d'],
            };
        }

        let todayPattern = new RegExp(
            TIME_PATTERNS.today.replace('%s', '([\\d+|:]+)')
        ).exec(timeLand);
        let tomorrowPattern = new RegExp(
            TIME_PATTERNS.tomorrow.replace('%s', '([\\d+|:]+)')
        ).exec(timeLand);
        let laterDatePattern = new RegExp(
            TIME_PATTERNS.later
                .replace('%1', '([\\d+|\\.]+)')
                .replace('%2', '([\\d+|:]+)')
        ).exec(timeLand);

        if (todayPattern !== null) {
            // today
            dateLand =
                serverDate[0] +
                '/' +
                serverDate[1] +
                '/' +
                serverDate[2] +
                ' ' +
                timeLand.match(/\d+:\d+:\d+:\d+/)[0];
        } else if (tomorrowPattern !== null) {
            // tomorrow
            let tomorrowDate = new Date(
                serverDate[1] + '/' + serverDate[0] + '/' + serverDate[2]
            );
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            dateLand =
                ('0' + tomorrowDate.getDate()).slice(-2) +
                '/' +
                ('0' + (tomorrowDate.getMonth() + 1)).slice(-2) +
                '/' +
                tomorrowDate.getFullYear() +
                ' ' +
                timeLand.match(/\d+:\d+:\d+:\d+/)[0];
        } else {
            // on
            let on = timeLand.match(/\d+.\d+/)[0].split('.');
            dateLand =
                on[0] +
                '/' +
                on[1] +
                '/' +
                serverDate[2] +
                ' ' +
                timeLand.match(/\d+:\d+:\d+:\d+/)[0];
        }

        return dateLand;
    },
    getTravelTimeInSecond: function (distance, unitSpeed) {
        let travelTime = distance * unitSpeed * 60;
        if (travelTime % 1 > 0.5) {
            return (travelTime += 1);
        } else {
            return travelTime;
        }
    },
    getTribeMembersById: function (tribeIds, players) {
        const tribeMemberIds = [];
        players.forEach((player) => {
            if (tribeIds.includes(parseInt(player[2]))) {
                tribeMemberIds.push(parseInt(player[0]));
            }
        });
        return tribeMemberIds;
    },
    getTroop: function (unit) {
        return parseInt(
            document.units[unit].parentNode
                .getElementsByTagName('a')[1]
                .innerHTML.match(/\d+/),
            10
        );
    },
    getVillageBuildings: function () {
        const buildings = game_data.village.buildings;
        const villageBuildings = [];

        for (let [key, value] of Object.entries(buildings)) {
            if (value > 0) {
                villageBuildings.push({
                    building: key,
                    level: value,
                });
            }
        }

        return villageBuildings;
    },
    getWorldConfig: async function () {
        const TIME_INTERVAL = 60 * 60 * 1000 * 24 * 7;
        const LAST_UPDATED_TIME =
            localStorage.getItem('world_config_last_updated') ?? 0;
        let worldConfig = [];

        if (LAST_UPDATED_TIME !== null) {
            if (Date.parse(new Date()) >= LAST_UPDATED_TIME + TIME_INTERVAL) {
                const response = await jQuery.ajax({
                    url: this.worldInfoInterface,
                });
                worldConfig = this.xml2json(jQuery(response));
                localStorage.setItem(
                    'world_config',
                    JSON.stringify(worldConfig)
                );
                localStorage.setItem(
                    'world_config_last_updated',
                    Date.parse(new Date())
                );
            } else {
                worldConfig = JSON.parse(localStorage.getItem('world_config'));
            }
        } else {
            const response = await jQuery.ajax({
                url: this.worldInfoInterface,
            });
            worldConfig = this.xml2json(jQuery(response));
            localStorage.setItem('world_config', JSON.stringify(unitInfo));
            localStorage.setItem(
                'world_config_last_updated',
                Date.parse(new Date())
            );
        }

        return worldConfig;
    },
    getWorldUnitInfo: async function () {
        const TIME_INTERVAL = 60 * 60 * 1000 * 24 * 7;
        const LAST_UPDATED_TIME =
            localStorage.getItem('units_info_last_updated') ?? 0;
        let unitInfo = [];

        if (LAST_UPDATED_TIME !== null) {
            if (Date.parse(new Date()) >= LAST_UPDATED_TIME + TIME_INTERVAL) {
                const response = await jQuery.ajax({
                    url: this.unitInfoInterface,
                });
                unitInfo = this.xml2json(jQuery(response));
                localStorage.setItem('units_info', JSON.stringify(unitInfo));
                localStorage.setItem(
                    'units_info_last_updated',
                    Date.parse(new Date())
                );
            } else {
                unitInfo = JSON.parse(localStorage.getItem('units_info'));
            }
        } else {
            const response = await jQuery.ajax({
                url: this.unitInfoInterface,
            });
            unitInfo = this.xml2json(jQuery(response));
            localStorage.setItem('units_info', JSON.stringify(unitInfo));
            localStorage.setItem(
                'units_info_last_updated',
                Date.parse(new Date())
            );
        }

        return unitInfo;
    },
    groupArrayByProperty: function (array, property, filter) {
        return array.reduce(function (accumulator, object) {
            // get the value of our object(age in our case) to use for group    the array as the array key
            const key = object[property];
            // if the current value is similar to the key(age) don't accumulate the transformed array and leave it empty
            if (!accumulator[key]) {
                accumulator[key] = [];
            }
            // add the value to the array
            accumulator[key].push(object[filter]);
            // return the transformed array
            return accumulator;
            // Also we also set the initial value of reduce() to an empty object
        }, {});
    },
    isArcherWorld: function () {
        return this.units.includes('archer');
    },
    isChurchWorld: function () {
        return 'church' in this.village.buildings;
    },
    isPaladinWorld: function () {
        return this.units.includes('knight');
    },
    isWatchTowerWorld: function () {
        return 'watchtower' in this.village.buildings;
    },
    loadJS: function (url, callback) {
        let scriptTag = document.createElement('script');
        scriptTag.src = url;
        scriptTag.onload = callback;
        scriptTag.onreadystatechange = callback;
        document.body.appendChild(scriptTag);
    },
    redirectTo: function (location) {
        window.location.assign(game_data.link_base_pure + location);
    },
    removeDuplicateObjectsFromArray: function (array, prop) {
        return array.filter((obj, pos, arr) => {
            return arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    },
    renderBoxWidget: function (body, id, mainClass, customStyle) {
        const globalStyle = this.addGlobalStyle();

        const content = `
            <div class="${mainClass} ra-box-widget" id="${id}">
                <div class="${mainClass}-header">
                    <h3>${this.tt(this.scriptData.name)}</h3>
                </div>
                <div class="${mainClass}-body">
                    ${body}
                </div>
                <div class="${mainClass}-footer">
                    <small>
                        <strong>
                            ${this.tt(this.scriptData.name)} ${
            this.scriptData.version
        }
                        </strong> -
                        <a href="${
                            this.scriptData.authorUrl
                        }" target="_blank" rel="noreferrer noopener">
                            ${this.scriptData.author}
                        </a> -
                        <a href="${
                            this.scriptData.helpLink
                        }" target="_blank" rel="noreferrer noopener">
                            ${this.tt('Help')}
                        </a>
                    </small>
                </div>
            </div>
            <style>
                .${mainClass} { position: relative; display: block; width: 100%; height: auto; clear: both; margin: 10px 0 15px; border: 1px solid #603000; box-sizing: border-box; background: #f4e4bc; }
                .${mainClass} * { box-sizing: border-box; }
                .${mainClass} > div { padding: 10px; }
                .${mainClass} .btn-confirm-yes { padding: 3px; }
                .${mainClass}-header { display: flex; align-items: center; justify-content: space-between; background-color: #c1a264 !important; background-image: url(/graphic/screen/tableheader_bg3.png); background-repeat: repeat-x; }
                .${mainClass}-header h3 { margin: 0; padding: 0; line-height: 1; }
                .${mainClass}-body p { font-size: 14px; }
                .${mainClass}-body label { display: block; font-weight: 600; margin-bottom: 6px; }
                
                ${globalStyle}

                /* Custom Style */
                ${customStyle}
            </style>
        `;

        if (jQuery(`#${id}`).length < 1) {
            jQuery('#contentContainer').prepend(content);
            jQuery('#mobileContent').prepend(content);
        } else {
            jQuery(`.${mainClass}-body`).html(body);
        }
    },
    renderFixedWidget: function (
        body,
        id,
        mainClass,
        customStyle,
        width,
        customName = this.scriptData.name
    ) {
        const globalStyle = this.addGlobalStyle();

        const content = `
            <div class="${mainClass} ra-fixed-widget" id="${id}">
                <div class="${mainClass}-header">
                    <h3>${this.tt(customName)}</h3>
                </div>
                <div class="${mainClass}-body">
                    ${body}
                </div>
                <div class="${mainClass}-footer">
                    <small>
                        <strong>
                            ${this.tt(customName)} ${this.scriptData.version}
                        </strong> -
                        <a href="${
                            this.scriptData.authorUrl
                        }" target="_blank" rel="noreferrer noopener">
                            ${this.scriptData.author}
                        </a> -
                        <a href="${
                            this.scriptData.helpLink
                        }" target="_blank" rel="noreferrer noopener">
                            ${this.tt('Help')}
                        </a>
                    </small>
                </div>
                <a class="popup_box_close custom-close-button" href="#">&nbsp;</a>
            </div>
            <style>
                .${mainClass} { position: fixed; top: 10vw; right: 10vw; z-index: 99999; border: 2px solid #7d510f; border-radius: 10px; padding: 10px; width: ${
            width ?? '360px'
        }; overflow-y: auto; padding: 10px; background: #e3d5b3 url('/graphic/index/main_bg.jpg') scroll right top repeat; }
                .${mainClass} * { box-sizing: border-box; }

                ${globalStyle}

                /* Custom Style */
                .custom-close-button { right: 0; top: 0; }
                ${customStyle}
            </style>
        `;

        if (jQuery(`#${id}`).length < 1) {
            if (mobiledevice) {
                jQuery('#content_value').prepend(content);
            } else {
                jQuery('#contentContainer').prepend(content);
                jQuery(`#${id}`).draggable({
                    cancel: '.ra-table, input, textarea, button, select, option',
                });

                jQuery(`#${id} .custom-close-button`).on('click', function (e) {
                    e.preventDefault();
                    jQuery(`#${id}`).remove();
                });
            }
        } else {
            jQuery(`.${mainClass}-body`).html(body);
        }
    },
    scriptInfo: function (scriptData = this.scriptData) {
        return `[${scriptData.name} ${scriptData.version}]`;
    },
    secondsToHms: function (timestamp) {
        const hours = Math.floor(timestamp / 60 / 60);
        const minutes = Math.floor(timestamp / 60) - hours * 60;
        const seconds = timestamp % 60;
        return (
            hours.toString().padStart(2, '0') +
            ':' +
            minutes.toString().padStart(2, '0') +
            ':' +
            seconds.toString().padStart(2, '0')
        );
    },
    setUpdateProgress: function (elementToUpdate, valueToSet) {
        jQuery(elementToUpdate).text(valueToSet);
    },
    sortArrayOfObjectsByKey: function (array, key) {
        return array.sort((a, b) => b[key] - a[key]);
    },
    startProgressBar: function (total) {
        const width = jQuery('#content_value')[0].clientWidth;
        const preloaderContent = `
            <div id="progressbar" class="progress-bar" style="margin-bottom:12px;">
                <span class="count label">0/${total}</span>
                <div id="progress">
                    <span class="count label" style="width: ${width}px;">
                        0/${total}
                    </span>
                </div>
            </div>
        `;

        if (this.isMobile) {
            jQuery('#content_value').eq(0).prepend(preloaderContent);
        } else {
            jQuery('#contentContainer').eq(0).prepend(preloaderContent);
        }
    },
    sumOfArrayItemValues: function (array) {
        return array.reduce((a, b) => a + b, 0);
    },
    randomItemPickerString: function (items, splitter = ' ') {
        const itemsArray = items.split(splitter);
        const chosenIndex = Math.floor(Math.random() * itemsArray.length);
        return itemsArray[chosenIndex];
    },
    randomItemPickerArray: function (items) {
        const chosenIndex = Math.floor(Math.random() * items.length);
        return items[chosenIndex];
    },
    timeAgo: function (seconds) {
        var interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' Y';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' M';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' D';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' H';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' m';

        return Math.floor(seconds) + ' s';
    },
    tt: function (string) {
        const spanishTranslations = this.translations['es_ES'] || {};
        return spanishTranslations[string] ?? string;
    },
    toggleUploadButtonStatus: function (elementToToggle) {
        jQuery(elementToToggle).attr('disabled', (i, v) => !v);
    },
    updateProgress: function (elementToUpate, itemsLength, index) {
        jQuery(elementToUpate).text(`${index}/${itemsLength}`);
    },
    updateProgressBar: function (index, total) {
        jQuery('#progress').css('width', `${((index + 1) / total) * 100}%`);
        jQuery('.count').text(`${index + 1}/${total}`);
        if (index + 1 == total) {
            jQuery('#progressbar').fadeOut(1000);
        }
    },
    xml2json: function ($xml) {
        let data = {};
        const _self = this;
        $.each($xml.children(), function (i) {
            let $this = $(this);
            if ($this.children().length > 0) {
                data[$this.prop('tagName')] = _self.xml2json($this);
            } else {
                data[$this.prop('tagName')] = $.trim($this.text());
            }
        });
        return data;
    },
    worldDataAPI: async function (entity) {
        const TIME_INTERVAL = 60 * 60 * 1000; // fetch data every hour
        const LAST_UPDATED_TIME = localStorage.getItem(
            `${entity}_last_updated`
        );

        // check if entity is allowed and can be fetched
        const allowedEntities = ['village', 'player', 'ally', 'conquer'];
        if (!allowedEntities.includes(entity)) {
            throw new Error(`Entity ${entity} does not exist!`);
        }

        // initial world data
        const worldData = {};

        const dbConfig = {
            village: {
                dbName: 'villagesDb',
                dbTable: 'villages',
                key: 'villageId',
                url: twSDK.worldDataVillages,
            },
            player: {
                dbName: 'playersDb',
                dbTable: 'players',
                key: 'playerId',
                url: twSDK.worldDataPlayers,
            },
            ally: {
                dbName: 'tribesDb',
                dbTable: 'tribes',
                key: 'tribeId',
                url: twSDK.worldDataTribes,
            },
            conquer: {
                dbName: 'conquerDb',
                dbTable: 'conquer',
                key: '',
                url: twSDK.worldDataConquests,
            },
        };

        // Helpers: Fetch entity data and save to localStorage
        const fetchDataAndSave = async () => {
            const DATA_URL = dbConfig[entity].url;

            try {
                // fetch data
                const response = await jQuery.ajax(DATA_URL);
                const data = twSDK.csvToArray(response);
                let responseData = [];

                // prepare data to be saved in db
                switch (entity) {
                    case 'village':
                        responseData = data
                            .filter((item) => {
                                if (item[0] != '') {
                                    return item;
                                }
                            })
                            .map((item) => {
                                return {
                                    villageId: parseInt(item[0]),
                                    villageName: twSDK.cleanString(item[1]),
                                    villageX: item[2],
                                    villageY: item[3],
                                    playerId: parseInt(item[4]),
                                    villagePoints: parseInt(item[5]),
                                    villageType: parseInt(item[6]),
                                };
                            });
                        break;
                    case 'player':
                        responseData = data
                            .filter((item) => {
                                if (item[0] != '') {
                                    return item;
                                }
                            })
                            .map((item) => {
                                return {
                                    playerId: parseInt(item[0]),
                                    playerName: twSDK.cleanString(item[1]),
                                    tribeId: parseInt(item[2]),
                                    villages: parseInt(item[3]),
                                    points: parseInt(item[4]),
                                    rank: parseInt(item[5]),
                                };
                            });
                        break;
                    case 'ally':
                        responseData = data
                            .filter((item) => {
                                if (item[0] != '') {
                                    return item;
                                }
                            })
                            .map((item) => {
                                return {
                                    tribeId: parseInt(item[0]),
                                    tribeName: twSDK.cleanString(item[1]),
                                    tribeTag: twSDK.cleanString(item[2]),
                                    players: parseInt(item[3]),
                                    villages: parseInt(item[4]),
                                    points: parseInt(item[5]),
                                    allPoints: parseInt(item[6]),
                                    rank: parseInt(item[7]),
                                };
                            });
                        break;
                    case 'conquer':
                        responseData = data
                            .filter((item) => {
                                if (item[0] != '') {
                                    return item;
                                }
                            })
                            .map((item) => {
                                return {
                                    villageId: parseInt(item[0]),
                                    unixTimestamp: parseInt(item[1]),
                                    newPlayerId: parseInt(item[2]),
                                    newPlayerId: parseInt(item[3]),
                                    oldTribeId: parseInt(item[4]),
                                    newTribeId: parseInt(item[5]),
                                    villagePoints: parseInt(item[6]),
                                };
                            });
                        break;
                    default:
                        return [];
                }

                // save data in db
                saveToIndexedDbStorage(
                    dbConfig[entity].dbName,
                    dbConfig[entity].dbTable,
                    dbConfig[entity].key,
                    responseData
                );

                // update last updated localStorage item
                localStorage.setItem(
                    `${entity}_last_updated`,
                    Date.parse(new Date())
                );

                return responseData;
            } catch (error) {
                throw Error(`Error al obtener ${DATA_URL}`);
            }
        };

        // Helpers: Save to IndexedDb storage
        async function saveToIndexedDbStorage(dbName, table, keyId, data) {
            const dbConnect = indexedDB.open(dbName);

            dbConnect.onupgradeneeded = function () {
                const db = dbConnect.result;
                if (keyId.length) {
                    db.createObjectStore(table, {
                        keyPath: keyId,
                    });
                } else {
                    db.createObjectStore(table, {
                        autoIncrement: true,
                    });
                }
            };

            dbConnect.onsuccess = function () {
                const db = dbConnect.result;
                const transaction = db.transaction(table, 'readwrite');
                const store = transaction.objectStore(table);
                store.clear(); // clean store from items before adding new ones

                data.forEach((item) => {
                    store.put(item);
                });

                UI.SuccessMessage('¡Base de datos actualizada!');
            };
        }

        // Helpers: Read all villages from indexedDB
        function getAllData(dbName, table) {
            return new Promise((resolve, reject) => {
                const dbConnect = indexedDB.open(dbName);

                dbConnect.onsuccess = () => {
                    const db = dbConnect.result;

                    const dbQuery = db
                        .transaction(table, 'readwrite')
                        .objectStore(table)
                        .getAll();

                    dbQuery.onsuccess = (event) => {
                        resolve(event.target.result);
                    };

                    dbQuery.onerror = (event) => {
                        reject(event.target.error);
                    };
                };

                dbConnect.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        }

        // Helpers: Transform an array of objects into an array of arrays
        function objectToArray(arrayOfObjects, entity) {
            switch (entity) {
                case 'village':
                    return arrayOfObjects.map((item) => [
                        item.villageId,
                        item.villageName,
                        item.villageX,
                        item.villageY,
                        item.playerId,
                        item.villagePoints,
                        item.villageType,
                    ]);
                case 'player':
                    return arrayOfObjects.map((item) => [
                        item.playerId,
                        item.playerName,
                        item.tribeId,
                        item.villages,
                        item.points,
                        item.rank,
                    ]);
                case 'ally':
                    return arrayOfObjects.map((item) => [
                        item.tribeId,
                        item.tribeName,
                        item.tribeTag,
                        item.players,
                        item.villages,
                        item.points,
                        item.allPoints,
                        item.rank,
                    ]);
                case 'conquer':
                    return arrayOfObjects.map((item) => [
                        item.villageId,
                        item.unixTimestamp,
                        item.newPlayerId,
                        item.newPlayerId,
                        item.oldTribeId,
                        item.newTribeId,
                        item.villagePoints,
                    ]);
                default:
                    return [];
            }
        }

        // decide what to do based on current time and last updated entity time
        if (LAST_UPDATED_TIME !== null) {
            if (
                Date.parse(new Date()) >=
                parseInt(LAST_UPDATED_TIME) + TIME_INTERVAL
            ) {
                worldData[entity] = await fetchDataAndSave();
            } else {
                worldData[entity] = await getAllData(
                    dbConfig[entity].dbName,
                    dbConfig[entity].dbTable
                );
            }
        } else {
            worldData[entity] = await fetchDataAndSave();
        }

        // transform the data so at the end an array of array is returned
        worldData[entity] = objectToArray(worldData[entity], entity);

        return worldData[entity];
    },
    zeroPad: function (num, count) {
        var numZeropad = num + '';
        while (numZeropad.length < count) {
            numZeropad = '0' + numZeropad;
        }
        return numZeropad;
    },

    // initialize library
    init: async function (scriptConfig) {
        const {
            scriptData,
            translations,
            allowedMarkets,
            allowedScreens,
            allowedModes,
            isDebug,
            enableCountApi,
        } = scriptConfig;

        this.scriptData = scriptData;
        this.translations = translations;
        this.allowedMarkets = allowedMarkets;
        this.allowedScreens = allowedScreens;
        this.allowedModes = allowedModes;
        this.enableCountApi = enableCountApi;
        this.isDebug = isDebug;

        twSDK._initDebug();
    },
};

(async function () {
    // Initialize Library
    await twSDK.init(scriptConfig);
    const scriptInfo = twSDK.scriptInfo();

    const { villages } = await fetchWorldData();
    const worldRuntimeConfig = await fetchWorldRuntimeConfig();

    // Fork state: report information is kept only in memory for this page load.
    // No polling, timers, background listeners or automatic attack actions are used.
    let lastFilteredBarbs = [];
    let reportIntelByCoord = {};

    // In-memory cache shared by every distance range while this script is open.
    // Key: target village coordinate. Value: latest report intelligence.
    let reportIntelCache = {};

    // Official standard carrying capacity of one light cavalry.
    // Scout carrying capacity is 0, so the fixed scout does not affect the calculation.
    const LIGHT_CARRY_CAPACITY = 80;
    const DEFAULT_LIGHTS_WITHOUT_REPORT = 10;

    // Classic 3 public setting. Runtime config is preferred; this value is the
    // safe fallback when /interface.php?func=get_config cannot be read.
    const CLASSIC_3_PRODUCTION_FACTOR = 1.7333333333333;
    const WORLD_PRODUCTION_FACTOR =
        worldRuntimeConfig.productionFactor || CLASSIC_3_PRODUCTION_FACTOR;

    // Entry point
    try {
        // build user interface
        buildUI();

        // register action handler
        handleFilterBarbs();
        handleResetFilters();
        handleUpdateReports();
    } catch (error) {
        UI.ErrorMessage(twSDK.tt('There was an error!'));
        console.error(`${scriptInfo} Error:`, error);
    }

    // Render: Build the user interface
    function buildUI() {
        const content = `
                <div class="ra-grid ra-grid-4">
                    <div class="ra-mb15">
                        <label for="raCurrentVillage" class="ra-label">${twSDK.tt(
                            'Current Village:'
                        )}</label>
                        <input type="text" id="raCurrentVillage" value="${
                            game_data.village.coord
                        }" class="ra-input">
                    </div>
                    <div class="ra-mb15">
                        <label for="radius" class="ra-label">${twSDK.tt(
                            'Radius:'
                        )}</label>
                        <select id="radius_choser" class="ra-input">
                            <option value="0|5" selected>1 - 5</option>
                            <option value="5|10">6 - 10</option>
                            <option value="10|15">11 - 15</option>
                            <option value="15|20">16 - 20</option>
                            <option value="20|25">21 - 25</option>
                            <option value="25|30">26 - 30</option>
                            <option value="30|35">31 - 35</option>
                            <option value="35|40">36 - 40</option>
                            <option value="40|45">41 - 45</option>
                            <option value="45|50">46 - 50</option>
                            <option value="50|55">51 - 55</option>
                            <option value="55|60">56 - 60</option>
                            <option value="60|65">61 - 65</option>
                            <option value="65|70">66 - 70</option>
                            <option value="70|75">71 - 75</option>
                            <option value="75|80">76 - 80</option>
                            <option value="80|85">81 - 85</option>
                            <option value="85|90">86 - 90</option>
                            <option value="90|95">91 - 95</option>
                            <option value="95|100">96 - 100</option>
                        </select>
                    </div>
                    <div class="ra-mb15">
                        <label for="minPoints" class="ra-label">${twSDK.tt(
                            'Min Points:'
                        )}</label>
                        <input type="text" id="minPoints" value="26" class="ra-input">
                    </div>
                    <div class="ra-mb15">
                        <label for="maxPoints" class="ra-label">${twSDK.tt(
                            'Max Points:'
                        )}</label>
                        <input type="text" id="maxPoints" value="12154" class="ra-input">
                    </div>
                </div>
                <div class="ra-mb15 ra-actions-row">
                    <a href="javascript:void(0);" id="btnFilterBarbs" class="btn btn-confirm-yes">
                        ${twSDK.tt('Filter')}
                    </a>
                    <a href="javascript:void(0);" id="btnResetFilters" class="btn btn-confirm-no">
                        ${twSDK.tt('Reset')}
                    </a>
                    <a href="javascript:void(0);" id="btnUpdateReports" class="btn">
                        ${twSDK.tt('Update Reports')}
                    </a>
                    <span class="ra-inline-label">
                        ${twSDK.tt('Report pages:')} ${twSDK.tt('All report pages')}
                    </span>
                    <span id="reportsStatus" class="ra-report-status"></span>
                </div>
                <div class="ra-mb15">
                    <strong>${twSDK.tt('Barbs found:')}</strong>
                    <span id="barbsCount">0</span>
                </div>
                <div class="ra-grid ra-grid-2">
                    <div>
                        <label for="barbCoordsList" class="ra-label">${twSDK.tt(
                            'Coordinates:'
                        )}</label>
                        <textarea id="barbCoordsList" class="ra-textarea" readonly></textarea>
                    </div>
                    <div>
                        <label for="barbScoutScript" class="ra-label">${twSDK.tt(
                            'Sequential Scout Script:'
                        )}</label>
                        <textarea id="barbScoutScript" class="ra-textarea" readonly></textarea>
                    </div>
                </div>
                <div id="barbariansTable" style="display:none;" class="ra-table-container ra-mt15"></div>
            `;

        const customStyle = `
                .ra-label { display: block; font-weight: 600; margin-bottom: 5px; }
                .ra-input { padding: 5px; width: 100%; display: block; line-height: 1; font-size: 14px; }
                .ra-grid { display: grid; gap: 15px; }
                .ra-grid-2 { grid-template-columns: 1fr 1fr; }
                .ra-grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
                .btn-already-sent { padding: 3px; }
                .already-sent-command { opacity: 0.6; }
                .ra-actions-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
                .ra-inline-label { display: inline-block; margin: 0 0 0 6px; font-weight: 600; }
                .ra-small-select { padding: 3px; width: auto; }
                .ra-report-status { margin-left: 4px; font-weight: 600; }
                .ra-status-good { color: #16830f; font-weight: 700; }
                .ra-status-empty { color: #a33a19; font-weight: 700; }
                .ra-status-neutral { color: #6b5a37; font-weight: 700; }
                .ra-resources { white-space: nowrap; }
            `;

        twSDK.renderBoxWidget(
            content,
            scriptConfig.scriptData.prefix,
            'ra-barbs-finder',
            customStyle
        );
    }

    // Action Handler: Handle filter barbs event
    function handleFilterBarbs() {
        jQuery('#btnFilterBarbs').on('click', function (e) {
            e.preventDefault();

            const currentVillage = $('#raCurrentVillage').val().trim();
            const minPoints = parseInt($('#minPoints').val().trim());
            const maxPoints = parseInt($('#maxPoints').val().trim());
            const [radiusMin, radiusMax] = $('#radius_choser')
                .val()
                .split('|')
                .map(Number);

            const barbarians = villages.filter(
                (village) => parseInt(village[4]) === 0
            );

            // Filter by min and max points
            const filteredBarbs = barbarians.filter((barbarian) => {
                return (
                    parseInt(barbarian[5]) >= minPoints &&
                    parseInt(barbarian[5]) <= maxPoints
                );
            });

            // Non-overlapping five-field ranges:
            // 1-5 means 0 < distance <= 5, 6-10 means 5 < distance <= 10, etc.
            const filteredByRadiusBarbs = filteredBarbs.filter((barbarian) => {
                const barbCoord = barbarian[2] + '|' + barbarian[3];
                const distance = twSDK.calculateDistance(
                    currentVillage,
                    barbCoord
                );

                return distance > radiusMin && distance <= radiusMax;
            });

            if (filteredByRadiusBarbs.length > 0) {
                let barbariansCoordsArray = filteredByRadiusBarbs.map(
                    (village) => village[2] + '|' + village[3]
                );
                let barbariansCount = barbariansCoordsArray.length;
                let barbariansCoordsList = barbariansCoordsArray.join(' ');

                // Change the visible range without losing report information
                // previously loaded for other ranges.
                lastFilteredBarbs = filteredByRadiusBarbs;
                reportIntelByCoord = getCachedIntelForBarbs(
                    filteredByRadiusBarbs
                );

                const scoutScript = generateSequentialScoutScript(
                    filteredByRadiusBarbs,
                    reportIntelByCoord
                );

                let tableContent = generateBarbariansTable(
                    filteredByRadiusBarbs,
                    currentVillage,
                    reportIntelByCoord
                );

                const cachedCount = Object.keys(reportIntelByCoord).length;

                jQuery('#barbsCount').text(barbariansCount);
                jQuery('#reportsStatus').text(
                    cachedCount > 0
                        ? `${cachedCount} informe(s) recuperado(s) del caché.`
                        : ''
                );
                jQuery('#barbCoordsList').text(barbariansCoordsList);
                jQuery('#barbScoutScript').val(scoutScript);
                jQuery('#barbariansTable').show();
                jQuery('#barbariansTable').html(tableContent);

                bindAttackButtonVisualState();
            } else {
                jQuery('#btnResetFilters').trigger('click');
                UI.InfoMessage(twSDK.tt('No barbarian villages found!'));
            }
        });
    }

    // Action Handler: Manually read the player's own attack reports.
    // This is intentionally user-triggered: no polling/background refresh is used.
    function handleUpdateReports() {
        jQuery('#btnUpdateReports').on('click', async function (e) {
            e.preventDefault();

            if (lastFilteredBarbs.length < 1) {
                UI.InfoMessage(twSDK.tt('Filter barbarian villages first!'));
                return;
            }

            const $button = jQuery(this);
            if ($button.attr('aria-disabled') === 'true') return;

            const currentVillage = jQuery('#raCurrentVillage').val().trim();

            $button.addClass('disabled').attr('aria-disabled', 'true');
            jQuery('#reportsStatus').text(twSDK.tt('Reading reports...'));

            try {
                const freshIntel = await fetchLatestReportIntel(
                    lastFilteredBarbs
                );

                // "Actualizar informes" always refreshes the current range.
                // Remove stale cache entries for this range, then save the
                // freshly discovered reports.
                lastFilteredBarbs.forEach((barb) => {
                    const coord = `${barb[2]}|${barb[3]}`;
                    delete reportIntelCache[coord];
                });

                Object.assign(reportIntelCache, freshIntel);

                reportIntelByCoord = getCachedIntelForBarbs(
                    lastFilteredBarbs
                );

                const tableContent = generateBarbariansTable(
                    lastFilteredBarbs,
                    currentVillage,
                    reportIntelByCoord
                );

                jQuery('#barbariansTable').html(tableContent).show();
                jQuery('#barbScoutScript').val(
                    generateSequentialScoutScript(
                        lastFilteredBarbs,
                        reportIntelByCoord
                    )
                );
                bindAttackButtonVisualState();
                // fetchLatestReportIntel already leaves a detailed final status
                // with pages, reports scanned and matched villages.
            } catch (error) {
                console.error(`${scriptInfo} Report reader error:`, error);
                jQuery('#reportsStatus').text(twSDK.tt('Could not read reports.'));
                UI.ErrorMessage(twSDK.tt('Could not read reports.'));
            } finally {
                $button.removeClass('disabled').removeAttr('aria-disabled');
            }
        });
    }

    // Action Handler: Handle reset Filters
    function handleResetFilters() {
        jQuery('#btnResetFilters').on('click', function (e) {
            e.preventDefault();

            jQuery('#raCurrentVillage').val(game_data.village.coord);
            jQuery('#minPoints').val(26);
            jQuery('#maxPoints').val(12154);
            jQuery('#radius_choser').val('0|5');
            jQuery('#barbsCount').text('0');
            jQuery('#barbCoordsList').text('');
            jQuery('#barbScoutScript').val('');
            jQuery('#reportsStatus').text('');
            lastFilteredBarbs = [];
            reportIntelByCoord = {};
            reportIntelCache = {};
            jQuery('#barbariansTable').hide();
            jQuery('#barbariansTable').html('');
        });
    }

    // Return only cached report information belonging to the supplied villages.
    function getCachedIntelForBarbs(barbs) {
        const intel = {};

        barbs.forEach((barb) => {
            const coord = `${barb[2]}|${barb[3]}`;
            if (reportIntelCache[coord]) {
                intel[coord] = reportIntelCache[coord];
            }
        });

        return intel;
    }

    // Generate Table
    function generateBarbariansTable(barbs, currentVillage, intelByCoord = {}) {
        if (barbs.length < 1) return;

        let barbariansWithDistance = [];

        barbs.forEach((barb) => {
            let barbCoord = barb[2] + '|' + barb[3];
            let distance = twSDK.calculateDistance(currentVillage, barbCoord);
            barbariansWithDistance.push([...barb, distance]);
        });

        barbariansWithDistance.sort((a, b) => {
            return a[7] - b[7];
        });

        let tableRows = generateTableRows(barbariansWithDistance, intelByCoord);

        let tableContent = `
                <table class="vis overview_table ra-table" width="100%">
                    <thead>
                        <tr>
                            <th>
                                #
                            </th>
                            <th>
                                ${twSDK.tt('Coords')}
                            </th>
                            <th>
                                ${twSDK.tt('Wall level')}
                            </th>
                            <th>
                                ${twSDK.tt('Dist.')}
                            </th>
                            <th>
                                ${twSDK.tt('Latest report')}
                            </th>
                            <th>
                                ${twSDK.tt('Estimated resources')}
                            </th>
                            <th>
                                ${twSDK.tt('Status')}
                            </th>
                            <th>
                                ${twSDK.tt('Attack')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;

        return tableContent;
    }

    // Generate Table Rows
    function generateTableRows(barbs, intelByCoord = {}) {
        let renderTableRows = '';

        barbs.forEach((barb, index) => {
            index++;
            const coord = `${barb[2]}|${barb[3]}`;
            const intel = intelByCoord[coord];
            const reportCell = renderLatestReportCell(intel);
            const wallCell = renderWallLevelCell(intel);
            const resourcesCell = renderResourcesCell(intel);
            const lightNeeded = calculateLightCavalryNeeded(intel);
            const statusCell = renderStatusCell(intel);

            renderTableRows += `
                    <tr>
                        <td class="ra-tac">
                            ${index}
                        </td>
                        <td class="ra-tac">
                            <a href="game.php?screen=info_village&id=${
                                barb[0]
                            }" target="_blank" rel="noopener noreferrer">
                                ${coord}
                            </a>
                        </td>
                        <td class="ra-tac">${wallCell}</td>
                        <td class="ra-tac">${barb[7].toFixed(2)}</td>
                        <td class="ra-tac">${reportCell}</td>
                        <td class="ra-tac ra-resources">${resourcesCell}</td>
                        <td class="ra-tac">${statusCell}</td>
                        <td class="ra-tac">
                            <a href="/game.php?screen=place&target=${
                                barb[0]
                            }&spy=1&light=${lightNeeded}" target="_blank" rel="noopener noreferrer" class="btn btn-send-attack" title="1 espía + ${lightNeeded} ligeras">
                                ${twSDK.tt('Attack')}
                            </a>
                        </td>
                    </tr>
                `;
        });

        return renderTableRows;
    }


    function calculateLightCavalryNeeded(intel) {
        // Explicit user requirement: no report => 10 light cavalry.
        if (!intel) {
            return DEFAULT_LIGHTS_WITHOUT_REPORT;
        }

        const estimated = calculateEstimatedResources(intel);

        // A report exists but its resource/building data could not be read.
        // Keep a practical fallback instead of generating an empty attack.
        if (!estimated || !Number.isFinite(Number(estimated.total))) {
            return DEFAULT_LIGHTS_WITHOUT_REPORT;
        }

        const totalResources = Math.max(0, Number(estimated.total));

        if (totalResources === 0) {
            return 0;
        }

        return Math.ceil(totalResources / LIGHT_CARRY_CAPACITY);
    }

    function calculateEstimatedResources(intel) {
        if (
            !intel ||
            !intel.resourcesKnown ||
            !intel.resources ||
            !Number.isFinite(Number(intel.resources.total))
        ) {
            return null;
        }

        const reportDate = parseReportDate(intel.dateText);
        const production = calculateHourlyProduction(
            intel.buildings,
            intel.villageType
        );

        // If the building levels or report time are unavailable, retain the
        // exact last-known resources rather than inventing production.
        if (!reportDate || !production) {
            return {
                wood: Math.max(0, Number(intel.resources.wood) || 0),
                stone: Math.max(0, Number(intel.resources.stone) || 0),
                iron: Math.max(0, Number(intel.resources.iron) || 0),
                total: Math.max(0, Number(intel.resources.total) || 0),
                elapsedHours: 0,
                productionKnown: false,
                hourlyProduction: null,
            };
        }

        const now = twSDK.getServerDateTimeObject();
        const elapsedHours = Math.max(
            0,
            (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60)
        );

        const estimated = {
            wood: Math.floor(
                Math.max(0, Number(intel.resources.wood) || 0) +
                    production.wood * elapsedHours
            ),
            stone: Math.floor(
                Math.max(0, Number(intel.resources.stone) || 0) +
                    production.stone * elapsedHours
            ),
            iron: Math.floor(
                Math.max(0, Number(intel.resources.iron) || 0) +
                    production.iron * elapsedHours
            ),
            elapsedHours,
            productionKnown: true,
            hourlyProduction: production,
        };

        estimated.total = estimated.wood + estimated.stone + estimated.iron;
        return estimated;
    }

    function calculateHourlyProduction(buildings, villageType = 0) {
        if (!buildings) return null;

        const woodLevel = normalizeBuildingLevel(buildings.wood);
        const stoneLevel = normalizeBuildingLevel(buildings.stone);
        const ironLevel = normalizeBuildingLevel(buildings.iron);

        if (
            woodLevel === null ||
            stoneLevel === null ||
            ironLevel === null
        ) {
            return null;
        }

        const production = {
            wood:
                getBaseResourceProduction(woodLevel) *
                WORLD_PRODUCTION_FACTOR,
            stone:
                getBaseResourceProduction(stoneLevel) *
                WORLD_PRODUCTION_FACTOR,
            iron:
                getBaseResourceProduction(ironLevel) *
                WORLD_PRODUCTION_FACTOR,
        };

        // Tribal Wars village.txt bonus IDs used by resource bonus villages.
        const bonusType = Number(villageType) || 0;
        if (bonusType === 1) production.wood *= 2;
        if (bonusType === 2) production.stone *= 2;
        if (bonusType === 3) production.iron *= 2;
        if (bonusType === 8) {
            production.wood *= 1.3;
            production.stone *= 1.3;
            production.iron *= 1.3;
        }

        production.wood = Math.round(production.wood);
        production.stone = Math.round(production.stone);
        production.iron = Math.round(production.iron);
        production.total =
            production.wood + production.stone + production.iron;

        return production;
    }

    function getBaseResourceProduction(level) {
        const normalizedLevel = Math.max(0, Math.min(30, Number(level) || 0));
        return Number(twSDK.resPerHour[normalizedLevel]) || 0;
    }

    function normalizeBuildingLevel(value) {
        const level = Number(value);
        if (!Number.isFinite(level) || level < 0) return null;
        return Math.max(0, Math.min(30, Math.floor(level)));
    }


    function generateSequentialScoutScript(barbs, intelByCoord = {}) {
        const targets = barbs.map((barb) => {
            const coord = `${barb[2]}|${barb[3]}`;
            const lightNeeded = calculateLightCavalryNeeded(
                intelByCoord[coord]
            );
            return `${coord}:${lightNeeded}`;
        });

        const targetsString = targets.join(' ');

        return `javascript:targets='${targetsString}';var doc=document;if(window.frames.length>0&&window.main!=null)doc=window.main.document;url=doc.URL;if(url.indexOf('screen=place')==-1)alert('¡Usa el script en la página de la plaza de reuniones!');targets=targets.split(' ');index=0;farmcookie=document.cookie.match('(^|;) ?farm=([^;]*)(;|$)');if(farmcookie!=null)index=parseInt(farmcookie[2]);if(index>=targets.length)alert('¡Se recorrieron todas las aldeas; ahora se reiniciará desde la primera!');if(index>=targets.length)index=0;target=targets[index].split(':');coords=target[0].split('|');lights=parseInt(target[1],10)||0;index=index+1;cookie_date=new Date(2030,1,1);document.cookie='farm='+index+';expires='+cookie_date.toGMTString();doc.forms[0].x.value=coords[0];doc.forms[0].y.value=coords[1];$('#place_target').find('input').val(coords[0]+'|'+coords[1]);doc.forms[0].spy.value=1;if(doc.forms[0].light)doc.forms[0].light.value=lights;`;
    }

    function renderLatestReportCell(intel) {
        if (!intel) return twSDK.tt('No report');

        const originalDate = intel.dateText || '';
        const relativeTime = formatRelativeReportTime(originalDate);
        const safeText = escapeHtml(
            relativeTime || originalDate || twSDK.tt('Open report')
        );
        const safeOriginalDate = escapeHtml(originalDate);

        if (!intel.url) return safeText;

        return `<a href="${escapeHtml(
            intel.url
        )}" target="_blank" rel="noopener noreferrer" title="${safeOriginalDate || twSDK.tt(
            'Open report'
        )}">${safeText}</a>`;
    }

    function formatRelativeReportTime(dateText) {
        const reportDate = parseReportDate(dateText);
        if (!reportDate) return '';

        const now = twSDK.getServerDateTimeObject();
        let diffSeconds = Math.floor((now.getTime() - reportDate.getTime()) / 1000);

        // Small clock differences should still display as "ahora".
        if (diffSeconds < 0 && diffSeconds > -120) {
            diffSeconds = 0;
        }

        if (diffSeconds < 0) return '';
        if (diffSeconds < 60) return 'hace menos de 1 min';

        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60) return `hace ${minutes} min`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `hace ${hours} h`;

        const days = Math.floor(hours / 24);
        if (days < 30) {
            return days === 1 ? 'hace 1 día' : `hace ${days} días`;
        }

        const months = Math.floor(days / 30);
        if (days < 365) {
            return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
        }

        const years = Math.floor(days / 365);
        return years === 1 ? 'hace 1 año' : `hace ${years} años`;
    }

    function parseReportDate(value) {
        const text = normalizeSpaces(value);
        if (!text) return null;

        const now = twSDK.getServerDateTimeObject();

        // Normalized format used by this fork: DD/MM/YYYY HH:mm[:ss].
        let match = text.match(
            /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );
        if (match) {
            let year = parseInt(match[3], 10);
            if (year < 100) year += 2000;
            return new Date(
                year,
                parseInt(match[2], 10) - 1,
                parseInt(match[1], 10),
                parseInt(match[4], 10),
                parseInt(match[5], 10),
                parseInt(match[6] || '0', 10)
            );
        }

        // Report-list format seen on the Spanish server: "jul 29, 02:49".
        const monthMap = {
            ene: 0,
            jan: 0,
            feb: 1,
            mar: 2,
            abr: 3,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            ago: 7,
            aug: 7,
            sep: 8,
            sept: 8,
            oct: 9,
            nov: 10,
            dic: 11,
            dec: 11,
        };

        match = text
            .toLowerCase()
            .match(
                /^([a-záéíóúñ]{3,4})\s+(\d{1,2}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/
            );

        if (match) {
            const monthKey = match[1]
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace('.', '');
            const month = monthMap[monthKey];

            if (month !== undefined) {
                let candidate = new Date(
                    now.getFullYear(),
                    month,
                    parseInt(match[2], 10),
                    parseInt(match[3], 10),
                    parseInt(match[4], 10),
                    parseInt(match[5] || '0', 10)
                );

                // Handle year rollover. Example: current date Jan 1 and report Dec 31.
                if (candidate.getTime() - now.getTime() > 24 * 60 * 60 * 1000) {
                    candidate = new Date(
                        now.getFullYear() - 1,
                        month,
                        parseInt(match[2], 10),
                        parseInt(match[3], 10),
                        parseInt(match[4], 10),
                        parseInt(match[5] || '0', 10)
                    );
                }

                return candidate;
            }
        }

        return null;
    }

    function renderWallLevelCell(intel) {
        if (
            !intel ||
            !Number.isFinite(Number(intel.wallLevel))
        ) {
            return '—';
        }

        return `<strong>${Math.max(
            0,
            Math.min(20, Math.floor(Number(intel.wallLevel)))
        )}</strong>`;
    }

    function renderResourcesCell(intel) {
        const estimated = calculateEstimatedResources(intel);
        if (!estimated) return '—';

        const tooltipParts = [];

        if (intel && intel.resourcesKnown) {
            tooltipParts.push(
                `Informe: ${twSDK.formatAsNumber(
                    intel.resources.wood
                )} / ${twSDK.formatAsNumber(
                    intel.resources.stone
                )} / ${twSDK.formatAsNumber(intel.resources.iron)}`
            );
        }

        if (estimated.productionKnown && estimated.hourlyProduction) {
            tooltipParts.push(
                `Producción/h: ${twSDK.formatAsNumber(
                    estimated.hourlyProduction.wood
                )} / ${twSDK.formatAsNumber(
                    estimated.hourlyProduction.stone
                )} / ${twSDK.formatAsNumber(
                    estimated.hourlyProduction.iron
                )}`
            );
            tooltipParts.push(
                `Tiempo: ${estimated.elapsedHours.toFixed(2)} h`
            );
        } else {
            tooltipParts.push('Sin niveles productivos: se usa el último dato conocido');
        }

        const title = escapeHtml(tooltipParts.join(' · '));

        return `<span title="${title}">${twSDK.formatAsNumber(
            estimated.wood
        )} / ${twSDK.formatAsNumber(
            estimated.stone
        )} / ${twSDK.formatAsNumber(
            estimated.iron
        )} (${twSDK.formatAsNumber(estimated.total)})</span>`;
    }

    function renderStatusCell(intel) {
        if (!intel) {
            return `<span class="ra-status-neutral">${twSDK.tt(
                'No report'
            )} · 10 ligeras</span>`;
        }

        const estimated = calculateEstimatedResources(intel);

        if (!estimated) {
            return `<span class="ra-status-neutral">${twSDK.tt(
                'No scout data'
            )}</span>`;
        }

        if (estimated.total > 0) {
            return `<span class="ra-status-good">${twSDK.tt(
                'Resources detected'
            )}</span>`;
        }

        return `<span class="ra-status-empty">${twSDK.tt(
            'No resources'
        )}</span>`;
    }

    function bindAttackButtonVisualState() {
        jQuery('.btn-send-attack')
            .off('click.barbsFinderFork')
            .on('click.barbsFinderFork', function () {
                // Visual marker only. The browser still opens the normal rally point
                // and the player must perform the game's normal attack flow manually.
                jQuery(this).addClass('btn-confirm-yes btn-already-sent');
                jQuery(this).closest('tr').addClass('already-sent-command');
            });
    }

    // Read-only report intelligence. The player must explicitly click
    // "Actualizar informes". Only same-origin Tribal Wars pages are requested.
    async function fetchLatestReportIntel(barbs) {
        const targetCoords = new Set(
            barbs.map((barb) => `${barb[2]}|${barb[3]}`)
        );
        const targetVillageMeta = new Map(
            barbs.map((barb) => [
                `${barb[2]}|${barb[3]}`,
                {
                    villageId: Number(barb[0]) || 0,
                    villageType: Number(barb[6]) || 0,
                },
            ])
        );
        const latestByCoord = {};
        const seenReportIds = new Set();
        const visitedOffsets = new Set();
        const pendingOffsets = [0];

        // Safety guard only. Normal execution stops at the last discovered page.
        const MAX_REPORT_PAGES = 100;
        let detectedPageSize = 0;
        let pagesScanned = 0;

        while (
            pendingOffsets.length > 0 &&
            visitedOffsets.size < MAX_REPORT_PAGES
        ) {
            // Always process offsets in chronological page order:
            // 0, 100, 200, 300...
            pendingOffsets.sort((a, b) => a - b);
            const offset = pendingOffsets.shift();

            if (visitedOffsets.has(offset)) continue;
            visitedOffsets.add(offset);

            const reportUrl = buildReportOverviewUrl(offset);

            jQuery('#reportsStatus').text(
                `${twSDK.tt('Reading report page')} ${
                    pagesScanned + 1
                } (${offset === 0 ? 'from=0' : `from=${offset}`})...`
            );

            const html = await jQuery.ajax({
                url: reportUrl,
                method: 'GET',
                dataType: 'html',
            });

            pagesScanned++;

            const pageData = parseAttackReportOverview(html, targetCoords);

            // A truly empty report page means there is nothing else to process.
            if (pageData.reportIds.length === 0) {
                continue;
            }

            // Discover the real pagination links exposed by Tribal Wars.
            // A single-page report list has no positive "from=" offsets.
            const discoveredOffsets = extractReportPageOffsets(html);
            const positiveDiscoveredOffsets = discoveredOffsets.filter(
                (value) => value > 0
            );
            const hasRealPagination = positiveDiscoveredOffsets.length > 0;

            // Detect the actual page size only from real pagination links.
            // Do not use the row count as evidence of another page: a single
            // page can contain exactly 20/50/100 reports and still be the end.
            if (!detectedPageSize && hasRealPagination) {
                detectedPageSize = detectReportPageSize(html);
            }

            // Determine whether this response contains any reports that were
            // not already returned by a previous offset.
            const newReportIds = pageData.reportIds.filter(
                (reportId) => !seenReportIds.has(reportId)
            );

            // If a non-zero offset returns no new IDs, the server ignored the
            // offset or repeated the last page. Stop this pagination branch
            // immediately and never infer another offset from this response.
            if (offset > 0 && newReportIds.length === 0) {
                pendingOffsets.length = 0;
                break;
            }

            pageData.reportIds.forEach((reportId) =>
                seenReportIds.add(reportId)
            );

            // Report pages are newest first. The first occurrence of a target
            // coordinate is its latest report; older pages cannot replace it.
            pageData.entries.forEach((entry) => {
                if (!latestByCoord[entry.coord]) {
                    const targetMeta = targetVillageMeta.get(entry.coord) || {};
                    latestByCoord[entry.coord] = {
                        ...entry,
                        villageId: targetMeta.villageId || 0,
                        villageType: targetMeta.villageType || 0,
                    };
                }
            });

            // Queue only pagination offsets that the game explicitly exposes.
            discoveredOffsets.forEach((nextOffset) => {
                if (
                    nextOffset > 0 &&
                    !visitedOffsets.has(nextOffset) &&
                    !pendingOffsets.includes(nextOffset)
                ) {
                    pendingOffsets.push(nextOffset);
                }
            });

            // Conservative fallback for pagers that expose only a sliding
            // window: infer the next offset only after real pagination has
            // been confirmed and only while this page contains new reports.
            if (
                detectedPageSize > 0 &&
                hasRealPagination &&
                newReportIds.length > 0 &&
                pageData.reportIds.length >= detectedPageSize
            ) {
                const inferredNextOffset = offset + detectedPageSize;

                if (
                    !visitedOffsets.has(inferredNextOffset) &&
                    !pendingOffsets.includes(inferredNextOffset)
                ) {
                    pendingOffsets.push(inferredNextOffset);
                }
            }

            // No pagination links on the first response means there is only
            // one page, even when that page is exactly full.
            if (offset === 0 && !hasRealPagination) {
                pendingOffsets.length = 0;
            }

            // A shorter page is the last page. Remove inferred offsets beyond
            // it, retaining only offsets explicitly present in the HTML.
            if (
                detectedPageSize > 0 &&
                pageData.reportIds.length < detectedPageSize
            ) {
                const explicitOffsets = new Set(discoveredOffsets);
                for (let i = pendingOffsets.length - 1; i >= 0; i--) {
                    const candidate = pendingOffsets[i];
                    if (
                        candidate > offset &&
                        !explicitOffsets.has(candidate)
                    ) {
                        pendingOffsets.splice(i, 1);
                    }
                }
            }

            await sleep(250);
        }

        const coordsToRead = Object.keys(latestByCoord);
        let detailIndex = 0;

        // Only open the latest report for each matched barbarian.
        for (const coord of coordsToRead) {
            const entry = latestByCoord[coord];
            if (!entry.url) continue;

            detailIndex++;
            jQuery('#reportsStatus').text(
                `${twSDK.tt('Opening latest reports')} ${detailIndex}/${
                    coordsToRead.length
                } · ${twSDK.tt('Reports scanned')}: ${
                    seenReportIds.size
                }`
            );

            try {
                await sleep(250);
                const reportHtml = await jQuery.ajax({
                    url: entry.url,
                    method: 'GET',
                    dataType: 'html',
                });

                const resources = extractScoutedResources(reportHtml);
                const buildings = extractScoutedBuildings(reportHtml);

                entry.buildings = buildings;
                entry.wallLevel =
                    buildings && Number.isFinite(Number(buildings.wall))
                        ? Number(buildings.wall)
                        : null;

                if (resources !== null) {
                    entry.resources = resources;
                    entry.resourcesKnown = true;
                } else if (entry.hasSpy && entry.lootExhausted) {
                    entry.resources = {
                        wood: 0,
                        stone: 0,
                        iron: 0,
                        total: 0,
                    };
                    entry.resourcesKnown = true;
                } else {
                    entry.resources = {
                        wood: 0,
                        stone: 0,
                        iron: 0,
                        total: 0,
                    };
                    entry.resourcesKnown = false;
                }
            } catch (error) {
                console.warn(
                    `${scriptInfo} Could not read report for ${coord}:`,
                    error
                );
                entry.resourcesKnown = false;
                entry.buildings = null;
                entry.wallLevel = null;
            }
        }

        const finalStatusParts = [
            `${twSDK.tt('Reports scanned')}: ${seenReportIds.size}`,
            `${twSDK.tt('Matched villages')}: ${coordsToRead.length}`,
            `${pagesScanned} pág.`,
        ];

        jQuery('#reportsStatus').text(finalStatusParts.join(' · '));

        return latestByCoord;
    }

    function buildReportOverviewUrl(offset = 0) {
        // The actual Tribal Wars report pagination uses "from=", not "page=".
        // Use mode=all so the parser sees the same report list structure as the
        // normal overview. Existing in-game report filters may still apply
        // at server/session level, but this fork does not display filter-warning text.
        let url = `${game_data.link_base_pure}report&mode=all`;

        if (offset > 0) {
            url += `&from=${offset}`;
        }

        return url;
    }

    function extractReportPageOffsets(html) {
        const doc = parseHtmlDocument(html);
        const offsets = new Set([0]);

        jQuery(doc)
            .find('a.paged-nav-item[href*="from="]')
            .each(function () {
                const href = jQuery(this).attr('href');
                const value = parseInt(
                    getQueryParameterFromUrl(href, 'from'),
                    10
                );

                if (Number.isFinite(value) && value >= 0) {
                    offsets.add(value);
                }
            });

        return [...offsets].sort((a, b) => a - b);
    }

    function detectReportPageSize(html) {
        const offsets = extractReportPageOffsets(html).filter(
            (offset) => offset > 0
        );

        if (offsets.length > 0) {
            return offsets[0];
        }

        return 0;
    }

    function parseAttackReportOverview(html, targetCoords) {
        const doc = parseHtmlDocument(html);
        const $doc = jQuery(doc);
        const entries = [];
        const reportIds = [];

        // The real report overview supplied by the game uses table#report_list
        // and a.report-link. Parse rows directly instead of searching every link
        // on the page, which was the cause of incomplete/fragile matches.
        $doc.find('#report_list tr').each(function () {
            const $row = jQuery(this);
            const $link = $row.find('a.report-link[href*="view="]').first();

            if (!$link.length) return;

            const href = $link.attr('href');
            const reportId =
                String($link.attr('data-id') || '').trim() ||
                getQueryParameterFromUrl(href, 'view');

            if (!href || !reportId) return;
            reportIds.push(reportId);

            const $subject = $row.find('.quickedit-label').first();
            const subjectText = normalizeSpaces(
                $subject.length ? $subject.text() : $link.text()
            );

            // Subjects have the attacker's village first and target village last:
            // "... (518|529) ... ataca a Pueblo bárbaro (520|531) ..."
            // Therefore use the LAST coordinate, not the first matching one.
            const coords = subjectText.match(/\d{1,3}\|\d{1,3}/g) || [];
            const targetCoord = coords.length
                ? coords[coords.length - 1]
                : null;

            if (!targetCoord || !targetCoords.has(targetCoord)) return;

            const hasSpy =
                $row.find(
                    'img[src*="/command/spy"], img[data-title*="Espías"], img[data-title*="Espias"]'
                ).length > 0;

            const $lootIcon = $row
                .find('img[src*="/max_loot/"], img[data-title^="Saqueo"]')
                .first();
            const lootSrc = String($lootIcon.attr('src') || '');
            const lootTitle = String($lootIcon.attr('data-title') || '');

            // max_loot/0 + "saquearon todo lo que encontraron" means the
            // attackers did not fill their capacity because no more resources
            // remained in the village after the attack.
            const lootExhausted =
                /\/max_loot\/0\.(?:webp|png|gif)/i.test(lootSrc) ||
                /saquearon todo lo que encontraron/i.test(lootTitle);

            const $dateCell = $row.find('td.nowrap').last();
            const dateText = normalizeReportDateText(
                normalizeSpaces($dateCell.text())
            );

            entries.push({
                reportId,
                coord: targetCoord,
                url: absoluteGameUrl(href),
                dateText,
                hasSpy,
                lootExhausted,
                resourcesKnown: false,
                resources: {
                    wood: 0,
                    stone: 0,
                    iron: 0,
                    total: 0,
                },
            });
        });

        return {
            entries,
            reportIds: [...new Set(reportIds)],
        };
    }

    function getQueryParameterFromUrl(url, parameter) {
        try {
            return new URL(url, window.location.origin).searchParams.get(
                parameter
            );
        } catch (error) {
            return null;
        }
    }

    function extractDateTextFromReportRow($row) {
        if (!$row || !$row.length) return '';

        // Prefer explicit title/data attributes used by some game layouts.
        const attributed = $row
            .find('[data-time], [data-timestamp], [title]')
            .map(function () {
                return (
                    jQuery(this).attr('data-time') ||
                    jQuery(this).attr('data-timestamp') ||
                    jQuery(this).attr('title') ||
                    ''
                );
            })
            .get()
            .find((value) => looksLikeDateTime(value));
        if (attributed) return normalizeReportDateText(attributed);

        const cellTexts = $row
            .find('td')
            .map(function () {
                return normalizeSpaces(jQuery(this).text());
            })
            .get()
            .filter(Boolean)
            .reverse();

        const matchingCell = cellTexts.find((value) => looksLikeDateTime(value));
        return normalizeReportDateText(matchingCell || cellTexts[0] || '');
    }

    function normalizeReportDateText(value) {
        const text = normalizeSpaces(value);
        if (!text) return '';

        const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
        if (!timeMatch) return text;

        if (/\bhoy\b|\btoday\b/i.test(text)) {
            const now = twSDK.getServerDateTimeObject();
            return `${twSDK.zeroPad(now.getDate(), 2)}/${twSDK.zeroPad(
                now.getMonth() + 1,
                2
            )}/${now.getFullYear()} ${timeMatch[1]}`;
        }

        if (/\bayer\b|\byesterday\b/i.test(text)) {
            const yesterday = twSDK.getServerDateTimeObject();
            yesterday.setDate(yesterday.getDate() - 1);
            return `${twSDK.zeroPad(yesterday.getDate(), 2)}/${twSDK.zeroPad(
                yesterday.getMonth() + 1,
                2
            )}/${yesterday.getFullYear()} ${timeMatch[1]}`;
        }

        return text;
    }

    function looksLikeDateTime(value) {
        if (!value) return false;
        return /(?:\d{1,2}[\/.\-]\d{1,2}(?:[\/.\-]\d{2,4})?|\bhoy\b|\bayer\b|\btoday\b|\byesterday\b).*?\d{1,2}:\d{2}|\d{1,2}:\d{2}(?::\d{2})?/i.test(
            value
        );
    }

    function extractScoutedBuildings(html) {
        const doc = parseHtmlDocument(html);
        const dataElement = doc.getElementById('attack_spy_building_data');

        if (dataElement) {
            const rawValue =
                dataElement.value ||
                dataElement.getAttribute('value') ||
                dataElement.textContent ||
                '';

            try {
                const parsed = JSON.parse(rawValue);
                const normalized = normalizeScoutedBuildingData(parsed);
                if (Object.keys(normalized).length > 0) {
                    return normalized;
                }
            } catch (error) {
                console.warn(
                    `${scriptInfo} Could not parse attack_spy_building_data:`,
                    error
                );
            }
        }

        // Fallback for layouts that render building rows without the JSON input.
        const result = {};
        const aliases = {
            wood: ['wood', 'timber', 'leñador', 'lenador', 'madera'],
            stone: ['stone', 'clay', 'barrera', 'barro', 'arcilla'],
            iron: ['iron', 'mina de hierro', 'hierro'],
            wall: ['wall', 'muralla'],
            storage: ['storage', 'warehouse', 'almacen', 'almacén'],
        };

        jQuery(doc)
            .find(
                '#attack_spy_buildings tr, .attack_spy_buildings tr, tr, .vis_item'
            )
            .each(function () {
                const $row = jQuery(this);
                const descriptor = normalizeSpaces(
                    `${$row.text()} ${$row.html() || ''}`
                )
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase();

                const levelMatch =
                    descriptor.match(
                        /(?:nivel|level)\s*[:\-]?\s*(\d{1,2})/i
                    ) ||
                    descriptor.match(/\b(\d{1,2})\b(?!.*\b\d{1,2}\b)/);

                if (!levelMatch) return;
                const level = parseInt(levelMatch[1], 10);
                if (!Number.isFinite(level)) return;

                for (const [buildingId, names] of Object.entries(aliases)) {
                    if (
                        result[buildingId] === undefined &&
                        names.some((name) => descriptor.includes(name))
                    ) {
                        result[buildingId] = level;
                        break;
                    }
                }
            });

        return Object.keys(result).length > 0 ? result : null;
    }

    function normalizeScoutedBuildingData(value) {
        const result = {};
        const items = Array.isArray(value)
            ? value
            : Array.isArray(value && value.buildings)
            ? value.buildings
            : value && typeof value === 'object'
            ? Object.entries(value).map(([id, level]) => ({ id, level }))
            : [];

        items.forEach((building) => {
            if (!building) return;

            const id = String(
                building.id ||
                    building.building ||
                    building.name ||
                    ''
            ).toLowerCase();
            const level = parseInt(
                building.level ??
                    building.value ??
                    building.current ??
                    building[1],
                10
            );

            if (!id || !Number.isFinite(level)) return;

            const normalizedId = normalizeBuildingId(id);
            if (normalizedId) {
                result[normalizedId] = level;
            }
        });

        return result;
    }

    function normalizeBuildingId(value) {
        const id = String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

        const mapping = {
            wood: 'wood',
            timber: 'wood',
            timber_camp: 'wood',
            stone: 'stone',
            clay: 'stone',
            clay_pit: 'stone',
            iron: 'iron',
            iron_mine: 'iron',
            wall: 'wall',
            storage: 'storage',
            warehouse: 'storage',
        };

        return mapping[id] || null;
    }

    function extractScoutedResources(html) {
        const doc = parseHtmlDocument(html);
        const $doc = jQuery(doc);
        let bestCandidate = null;

        // Inspect report rows and compact blocks. Do not inspect the entire page as
        // one container because loot tooltips also contain wood/stone/iron icons.
        $doc.find('tr, .report_ReportAttack, .report-result, .vis_item').each(
            function () {
                const $container = jQuery(this);
                const text = normalizeSpaces($container.text());
                const lowerText = text.toLowerCase();

                // Loot/plunder is what the army carried away, not the resources
                // remaining/revealed by scouting.
                if (
                    /bot[ií]n|saqueo|saquead|loot|plunder|recursos saqueados/.test(
                        lowerText
                    )
                ) {
                    return;
                }

                const resources = extractResourcesFromContainer($container);
                let score = 1;

                if (
                    /recursos|resources|espi|explor|scout|restant|dispon/.test(
                        lowerText
                    )
                ) {
                    score = 10;
                }

                if (resources !== null) {
                    if (!bestCandidate || score > bestCandidate.score) {
                        bestCandidate = {
                            score,
                            resources,
                        };
                    }
                    return;
                }

                // Some report layouts omit the three resource icons when every
                // scouted value is zero and render only an explicit "Recursos: 0"
                // or "0 0 0". Treat that as known zero, not missing scout data.
                if (
                    /recursos|resources/.test(lowerText) &&
                    isExplicitZeroResourceText(text)
                ) {
                    const zeroResources = {
                        wood: 0,
                        stone: 0,
                        iron: 0,
                        total: 0,
                    };

                    if (!bestCandidate || score > bestCandidate.score) {
                        bestCandidate = {
                            score,
                            resources: zeroResources,
                        };
                    }
                }
            }
        );

        return bestCandidate ? bestCandidate.resources : null;
    }

    function extractResourcesFromContainer($container) {
        const aliases = {
            wood: ['wood', 'holz'],
            stone: ['stone', 'clay', 'lehm'],
            iron: ['iron', 'eisen'],
        };
        const result = {};

        for (const [resource, names] of Object.entries(aliases)) {
            let $icon = jQuery();

            for (const name of names) {
                $icon = $container
                    .find(
                        `span.icon.${name}, span.${name}, .icon.header.${name}, img[src*="${name}"]`
                    )
                    .first();
                if ($icon.length) break;
            }

            if (!$icon.length) return null;

            const amount = readNumberFollowingElement($icon[0]);
            if (amount === null) return null;

            result[resource] = amount;
        }

        result.total = result.wood + result.stone + result.iron;
        return result;
    }

    function readNumberFollowingElement(element) {
        // Tribal Wars commonly wraps each resource icon and amount in
        // <span class="nowrap">...</span>. Reading that wrapper independently
        // prevents the wood amount from being reused for clay/iron.
        const $nowrap = jQuery(element).closest('.nowrap');
        if ($nowrap.length) {
            const wrappedAmount = parseGameNumber($nowrap.text());
            if (wrappedAmount !== null) return wrappedAmount;
        }

        let node = element.nextSibling;
        let collected = '';

        while (node) {
            if (node.nodeType === 1 && isResourceIcon(node)) break;

            collected += ` ${node.textContent || ''}`;
            const number = parseGameNumber(collected);
            if (number !== null) return number;

            node = node.nextSibling;
        }

        // Last fallback: use the immediate parent only.
        const parentText = element.parentNode
            ? element.parentNode.textContent
            : '';
        return parseGameNumber(parentText);
    }

    function isResourceIcon(node) {
        if (!node || node.nodeType !== 1) return false;

        const descriptor = `${node.className || ''} ${
            node.getAttribute('src') || ''
        }`.toLowerCase();

        return /(?:wood|holz|stone|clay|lehm|iron|eisen)/.test(descriptor);
    }

    function isExplicitZeroResourceText(value) {
        const text = normalizeSpaces(value)
            .replace(/recursos|resources|madera|barro|arcilla|hierro|wood|stone|clay|iron/gi, ' ')
            .trim();

        // Require at least one explicit zero and reject any positive digit.
        return /(?:^|\D)0(?:\D|$)/.test(text) && !/[1-9]/.test(text);
    }

    function parseGameNumber(value) {
        if (value === null || value === undefined) return null;

        const text = String(value).trim();
        if (!text) return null;

        const match = text.match(/\d[\d.\s,]*/);
        if (!match) return null;

        const digits = match[0].replace(/[^\d]/g, '');
        return digits.length ? parseInt(digits, 10) : null;
    }

    function parseHtmlDocument(html) {
        return new DOMParser().parseFromString(String(html || ''), 'text/html');
    }

    function absoluteGameUrl(href) {
        try {
            return new URL(href, window.location.origin).toString();
        } catch (error) {
            return href;
        }
    }

    function normalizeSpaces(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function fetchWorldRuntimeConfig() {
        const fallback = {
            productionFactor: 1.7333333333333,
            source: 'Classic 3 fallback',
        };

        try {
            const response = await jQuery.ajax({
                url: '/interface.php?func=get_config',
                method: 'GET',
                dataType: 'xml',
            });

            const $xml = jQuery(response);
            const speed = parseFloat(
                $xml.find('config > speed, speed').first().text()
            );
            const baseProduction = parseFloat(
                $xml
                    .find(
                        'config > game > base_production, game > base_production, base_production'
                    )
                    .first()
                    .text()
            );

            // Standard level-1 production is 30/h. The public world settings
            // express production as a multiplier of that standard value.
            const productionFactor =
                Number.isFinite(speed) &&
                Number.isFinite(baseProduction) &&
                speed > 0 &&
                baseProduction > 0
                    ? (speed * baseProduction) / 30
                    : fallback.productionFactor;

            return {
                productionFactor,
                source: 'runtime world config',
            };
        } catch (error) {
            console.warn(
                `${scriptInfo} Could not read world config; using Classic 3 fallback.`,
                error
            );
            return fallback;
        }
    }

    // Helper: Fetch all required world data
    async function fetchWorldData() {
        try {
            const villages = await twSDK.worldDataAPI('village');
            return { villages };
        } catch (error) {
            UI.ErrorMessage(error);
            console.error(`${scriptInfo} Error:`, error);
        }
    }
})();
