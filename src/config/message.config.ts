export namespace MessagesConfig {
    // === FILE CONFIG ===
    export const SUPPORTED_FILE_FORMAT = [
        // Dokumenty
        'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt',
        // Tabulky a prezentace
        'xls', 'xlsx', 'ods', 'ppt', 'pptx',
        // Obrázky (např. přílohy, snímky úloh)
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
        // Komprimované archivy (pro balíčky úloh apod.)
        'zip'
    ];
    export const MESSAGE_FILES_LIMIT = 10;
    export const FILE_MAX_SIZE_MB = 15;

    // === TITLE CONFIG ===
    export const MESSAGE_TITLE_MAX_LENGTH = 100;
    export const MESSAGE_TITLE_MIN_LENGTH = 3;

    // === MESSAGE CONFIG ===
    export const MESSAGE_CONTENT_MAX_LENGTH = 3000;
    export const MESSAGE_CONTENT_MIN_LENGTH = 3;
}