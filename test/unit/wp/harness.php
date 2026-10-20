<?php
// A minimal stand-in for WordPress, enough to load a StadiaRef plugin file
// and run its pieces from the command line:
//   php harness.php <plugin file> <scenario JSON>
// The scenario sets the options, the user's capabilities and which actions
// to run; the result (options, enqueued scripts, inline scripts, notices) is
// printed as JSON. Used by test/unit/wordpress.test.mjs.

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'MINUTE_IN_SECONDS', 60 );

$scenario = json_decode( $argv[2], true );
$GLOBALS['options']  = $scenario['options'] ?? [];
$GLOBALS['caps']     = $scenario['caps'] ?? [];
$GLOBALS['hooks']    = [];
$GLOBALS['scripts']  = [];
$GLOBALS['inline']   = [];
$GLOBALS['enqueued_before'] = $scenario['enqueued'] ?? [];
$GLOBALS['site_transients'] = [];
foreach ( $scenario['site_transients'] ?? [] as $key => $value ) {
    $transient = (object) $value;
    if ( isset( $transient->response ) && is_array( $transient->response ) ) {
        foreach ( $transient->response as $plugin => $update ) {
            $transient->response[ $plugin ] = (object) $update;
        }
    }
    $GLOBALS['site_transients'][ $key ] = $transient;
}

class WP_Error {
    public $code;
    public $message;
    function __construct( $code, $message ) { $this->code = $code; $this->message = $message; }
}

function add_action( $hook, $fn, $priority = 10 ) { $GLOBALS['hooks'][ $hook ][ $priority ][] = $fn; }
function add_filter( $hook, $fn, $priority = 10 ) { add_action( $hook, $fn, $priority ); }
function do_action_all( $hook ) {
    $by = $GLOBALS['hooks'][ $hook ] ?? [];
    ksort( $by );
    foreach ( $by as $fns ) foreach ( $fns as $fn ) $fn();
}
function apply_filters_all( $hook, $value, ...$args ) {
    $by = $GLOBALS['hooks'][ $hook ] ?? [];
    ksort( $by );
    foreach ( $by as $fns ) foreach ( $fns as $fn ) $value = $fn( $value, ...$args );
    return $value;
}
function register_activation_hook( $file, $fn ) { $GLOBALS['hooks']['activate'][10][] = $fn; }
function get_option( $key, $default = false ) { return array_key_exists( $key, $GLOBALS['options'] ) ? $GLOBALS['options'][ $key ] : $default; }
function add_option( $key, $value ) { if ( ! array_key_exists( $key, $GLOBALS['options'] ) ) $GLOBALS['options'][ $key ] = $value; return true; }
function update_option( $key, $value ) { $GLOBALS['options'][ $key ] = $value; return true; }
function register_setting() {}
function set_transient() {}
function get_transient() { return false; }
function delete_transient() {}
function get_site_transient( $key ) { return $GLOBALS['site_transients'][ $key ] ?? false; }
function current_user_can( $cap ) { return in_array( $cap, $GLOBALS['caps'], true ); }
function plugin_dir_path( $file ) { return dirname( $file ) . '/'; }
function plugin_dir_url( $file ) { return 'https://example.test/plugin/'; }
function plugin_basename( $file ) { return basename( dirname( $file ) ) . '/' . basename( $file ); }
function admin_url( $p = '' ) { return 'https://example.test/wp-admin/' . $p; }
function get_stylesheet_directory() { return '/nonexistent'; }
function get_stylesheet_directory_uri() { return 'https://example.test/theme'; }
function wp_script_is( $handle, $what ) { return in_array( $handle, array_merge( $GLOBALS['enqueued_before'], array_keys( $GLOBALS['scripts'] ) ), true ); }
function wp_enqueue_script( $handle, $src, $deps = [], $ver = false, $footer = false ) { $GLOBALS['scripts'][ $handle ] = [ 'src' => $src, 'footer' => $footer ]; }
function wp_add_inline_script( $handle, $js, $position ) { $GLOBALS['inline'][] = [ 'handle' => $handle, 'js' => $js, 'position' => $position ]; }
function wp_localize_script( $handle, $name, $data ) { $GLOBALS['inline'][] = [ 'handle' => $handle, 'localize' => $name, 'data' => $data ]; }
function wp_json_encode( $v ) { return json_encode( $v ); }
function wp_parse_url( $url ) { return parse_url( $url ); }
function is_wp_error( $value ) { return $value instanceof WP_Error; }
function download_url() {
    $file = tempnam( sys_get_temp_dir(), 'stadiaref-download-' );
    file_put_contents( $file, $GLOBALS['scenario_download_body'] ?? '' );
    return $file;
}
function wp_delete_file( $file ) { if ( is_file( $file ) ) unlink( $file ); }
function esc_url( $s ) { return $s; }
function esc_html( $s ) { return htmlspecialchars( (string) $s ); }
function esc_attr( $s ) { return htmlspecialchars( (string) $s ); }
function esc_html__( $s ) { return htmlspecialchars( $s ); }
function esc_html_e( $s ) { echo htmlspecialchars( $s ); }
function __( $s ) { return $s; }
function get_current_user_id() { return 1; }
function get_user_meta( $id, $key, $single = false ) { return $GLOBALS['options'][ 'user_meta_' . $key ] ?? ''; }
function add_query_arg( $k, $v = null ) { return '?' . $k . '=' . $v; }
function wp_nonce_url( $url, $action ) { return $url . '&_wpnonce=x'; }

foreach ( $scenario['defines'] ?? [] as $name => $value ) define( $name, $value );
$GLOBALS['scenario_download_body'] = $scenario['download_body'] ?? '';

require $argv[1];

ob_start();
foreach ( $scenario['run'] ?? [] as $hook ) do_action_all( $hook );
$notices = ob_get_clean();

$call = null;
if ( ( $scenario['call']['name'] ?? '' ) === 'release_asset' ) {
    $call = stadiaref_release_zip_asset( $scenario['call']['release'] ?? [], $scenario['call']['version'] ?? '' );
}
if ( ( $scenario['call']['name'] ?? '' ) === 'verify_download' ) {
    $verified = apply_filters_all( 'upgrader_pre_download', false, $scenario['call']['package'] ?? '' );
    if ( is_wp_error( $verified ) ) {
        $call = [ 'error' => $verified->code, 'message' => $verified->message ];
    } else {
        $call = [ 'body' => is_file( $verified ) ? file_get_contents( $verified ) : null ];
        if ( is_file( $verified ) ) wp_delete_file( $verified );
    }
}

echo json_encode( [
    'options' => (object) $GLOBALS['options'],
    'scripts' => (object) $GLOBALS['scripts'],
    'inline'  => $GLOBALS['inline'],
    'notices' => $notices,
    'call'    => $call,
] );
