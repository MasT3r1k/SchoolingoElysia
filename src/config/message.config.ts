export namespace MessagesConfig {
    // === FILE CONFIG ===
    export const SUPPORTED_FILE_FORMAT = [
    // Dokumenty
    '.pdf', '.doc', '.docx', '.docm', '.dot', '.odt', '.odm', '.rtf', '.txt', '.tex',
    
    // Tabulky
    '.xls', '.xlsx', '.xlsm', '.ods', '.xlr', '.stc', '.sxc',
    
    // Prezentace
    '.ppt', '.pptx', '.pptm', '.odp', '.pps',
    
    // Audio
    '.mp3', '.wav', '.wma', '.ogg',
    
    // Video
    '.avi', '.flv', '.h264', '.m4v', '.mkv', '.mov', '.mp4', '.mpg', '.mpeg', '.wmv',
    
    // Obrázky
    '.bmp', '.gif', '.ico', '.jpeg', '.jpg', '.jpe', '.png', '.svg', '.tif', '.tiff', '.wdp',
    
    // Web / kód
    '.css', '.html', '.htm', '.php', '.xhtml', '.rss', '.xml',
    
    // Archivy / zálohy
    '.zip', '.7z', '.rar', '.tar', '.cab', '.bak', '.iso', '.csv', '.log',
    
    // CAD / 3D
    '.cad', '.cdr', '.cmx', '.odg', '.vsd', '.vsdx', '.dwg', '.dxf', '.sat', '.stp', '.step',
    'dwf', '.ifc', '.igs', '.iges', '.man', '.cv7', '.ipt', '.iam', '.ipj', '.jt', '.dgn',
    'prp', '.prw', '.x_b', '.dri', '.rvm', '.skp', '.stl', '.wrl', '.wrz', '.3ds', '.fbx',

    ];
    export const MESSAGE_FILES_LIMIT = 10;
    export const FILE_MAX_SIZE_MB = 20;

    // === TITLE CONFIG ===
    export const MESSAGE_TITLE_MAX_LENGTH = 100;
    export const MESSAGE_TITLE_MIN_LENGTH = 3;

    // === MESSAGE CONFIG ===
    export const MESSAGE_CONTENT_MAX_LENGTH = 3000;
    export const MESSAGE_CONTENT_MIN_LENGTH = 3;
}