<?php
/**
 * Plugin Name:       StadiaRef
 * Plugin URI:        https://github.com/segurudigital/stadiaref
 * Description:       An address for every part of the screen. Shows each data-ref address as a label you can point at and copy.
 * Version:           3.0.0-dev
 * Author:            Seguru Digital
 * Author URI:        https://seguru.digital
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       stadiaref
 * Requires PHP:      8.1
 * Requires at least: 5.8
 * Tested up to:      7.1
 *
 * Install: Upload via wp-admin → Plugins → Add New → Upload.
 * Then configure under Settings → StadiaRef.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Constants ─────────────────────────────────────────────────
define( 'STADIAREF_VERSION', '3.0.0-dev' );
define( 'STADIAREF_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'STADIAREF_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'STADIAREF_OPTION_GROUP', 'stadiaref_settings' );
define( 'STADIAREF_HANDLE', 'stadiaref' );

// ── Options ───────────────────────────────────────────────────
// Every setting, its default and how it is cleaned.
function stadiaref_defaults() {
    return [
        'stadiaref_enabled'         => '0',
        'stadiaref_labels'          => 'full',
        'stadiaref_start_hidden'    => '1',
        'stadiaref_dock'            => 'bottom-right',
        'stadiaref_min_role'        => 'administrator',
        'stadiaref_class_converter' => '0',
        'stadiaref_auto_address'    => '0',
        'stadiaref_profile'         => 'generic',
    ];
}

function stadiaref_choices() {
    return [
        'stadiaref_labels'   => [ 'full', 'icons', 'off' ],
        'stadiaref_dock'     => [ 'bottom-right', 'bottom-left', 'top-right', 'top-left' ],
        'stadiaref_min_role' => [ 'administrator', 'editor', 'author' ],
        'stadiaref_profile'  => [ 'generic', 'titan', 'app' ],
    ];
}

// A value for $key, cleaned: one of its choices, or '1' / '0' for a switch.
function stadiaref_sanitize( $key, $value ) {
    $defaults = stadiaref_defaults();
    $choices  = stadiaref_choices();
    if ( isset( $choices[ $key ] ) ) {
        return in_array( $value, $choices[ $key ], true ) ? $value : $defaults[ $key ];
    }
    return $value === '1' ? '1' : '0';
}

function stadiaref_get( $key ) {
    $defaults = stadiaref_defaults();
    return stadiaref_sanitize( $key, get_option( $key, $defaults[ $key ] ?? '' ) );
}

// Map role slug → WP capability for the access check
function stadiaref_role_capability( $role ) {
    $map = [
        'administrator' => 'manage_options',
        'editor'        => 'edit_others_posts',
        'author'        => 'publish_posts',
    ];
    return $map[ $role ] ?? 'manage_options';
}

// ── Settings carried over from Seguru Debug Toolbar 2.x ───────
// Each 3.0 option is copied once from its 2.x option. It runs on
// activation and on admin_init: activation alone misses the mu-plugin and
// network activation. A flag option makes it run once. The 2.x options are
// left in place.
if ( ! function_exists( 'stadiaref_migrate_2x' ) ) {
    function stadiaref_migrate_2x() {
        if ( get_option( 'stadiaref_migrated_2x' ) ) return;
        $labels = [ '2' => 'full', '0' => 'icons', '1' => 'off' ];
        $map    = [
            'stadiaref_enabled'         => [ 'sdt_enabled', null ],
            'stadiaref_labels'          => [ 'sdt_default_mode', $labels ],
            'stadiaref_start_hidden'    => [ 'sdt_start_hidden', null ],
            'stadiaref_dock'            => [ 'sdt_position', null ],
            'stadiaref_min_role'        => [ 'sdt_min_role', null ],
            'stadiaref_class_converter' => [ 'sdt_class_converter', null ],
            'stadiaref_auto_address'    => [ 'sdt_auto_ref', null ],
        ];
        foreach ( $map as $new => [ $old, $values ] ) {
            $value = get_option( $old, null );
            if ( $value === null || $value === false ) continue;
            if ( get_option( $new, null ) !== null ) continue; // already set in 3.0
            if ( $values !== null ) {
                if ( ! isset( $values[ (string) $value ] ) ) continue;
                $value = $values[ (string) $value ];
            }
            add_option( $new, stadiaref_sanitize( $new, (string) $value ) );
        }
        update_option( 'stadiaref_migrated_2x', STADIAREF_VERSION );
    }
}

register_activation_hook( __FILE__, function () {
    stadiaref_migrate_2x();
    set_transient( 'stadiaref_activation_notice', true, 60 );
} );

// ── Register settings ─────────────────────────────────────────
add_action( 'admin_init', function () {
    stadiaref_migrate_2x();
    foreach ( stadiaref_defaults() as $key => $default ) {
        register_setting( STADIAREF_OPTION_GROUP, $key, [
            'type'              => 'string',
            'sanitize_callback' => function ( $v ) use ( $key ) { return stadiaref_sanitize( $key, is_string( $v ) ? $v : '' ); },
            'default'           => $default,
        ] );
    }
} );

// ── Settings page menu item ───────────────────────────────────
add_action( 'admin_menu', function () {
    add_options_page(
        'StadiaRef',                        // page title
        'StadiaRef',                        // menu title
        'manage_options',                   // capability
        'stadiaref',                        // menu slug
        'stadiaref_render_settings_page'    // callback
    );
} );

// ── Add Settings link on Plugins list ─────────────────────────
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
    $url = admin_url( 'options-general.php?page=stadiaref' );
    array_unshift( $links, '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'stadiaref' ) . '</a>' );
    return $links;
} );

// ── Seguru Debug Toolbar still active ─────────────────────────
// The 2.x plugin (or its 2.5.1 bridge) defines SDT_VERSION; the 2.x
// mu-plugin enqueues the script handle 'seguru-debug-toolbar'.
function stadiaref_old_plugin_active() {
    return defined( 'SDT_VERSION' );
}

// ── Admin notices ─────────────────────────────────────────────
add_action( 'admin_notices', function () {
    if ( get_transient( 'stadiaref_activation_notice' ) ) {
        delete_transient( 'stadiaref_activation_notice' );
        $url = admin_url( 'options-general.php?page=stadiaref' );
        echo '<div class="notice notice-info is-dismissible"><p>';
        printf(
            /* translators: %s: link to the settings page */
            esc_html__( 'StadiaRef is active. Turn it on and choose who sees it under %s.', 'stadiaref' ),
            '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings, StadiaRef', 'stadiaref' ) . '</a>'
        );
        echo '</p></div>';
    }
    if ( stadiaref_old_plugin_active() && current_user_can( 'activate_plugins' ) ) {
        echo '<div class="notice notice-warning"><p><strong>' . esc_html__( 'Seguru Debug Toolbar is still active.', 'stadiaref' ) . '</strong> ';
        printf(
            /* translators: %s: link to the Plugins page */
            esc_html__( 'StadiaRef replaces it, and your settings have been copied across. Deactivate Seguru Debug Toolbar on the %s. Until then, StadiaRef doesn\'t load on the front end, so the page never has two copies.', 'stadiaref' ),
            '<a href="' . esc_url( admin_url( 'plugins.php' ) ) . '">' . esc_html__( 'Plugins page', 'stadiaref' ) . '</a>'
        );
        echo '</p></div>';
    }
} );

// ── GitHub-based self-update ──────────────────────────────────
// Checks the GitHub releases API for newer versions and feeds the zip asset
// into WordPress's native update flow. Admins see a standard "Update available"
// notice on Plugins and Dashboard → Updates, same as any wp.org plugin.
//
// Release zip asset name must match /stadiaref-wp-v[\d.]+\.zip/
// (the output of scripts/build-wp-zip.sh).
define( 'STADIAREF_GITHUB_REPO', 'segurudigital/stadiaref' );
define( 'STADIAREF_UPDATE_CACHE_KEY', 'stadiaref_github_release' );
define( 'STADIAREF_UPDATE_CACHE_TTL', 6 * HOUR_IN_SECONDS );

function stadiaref_fetch_latest_release() {
    $cached = get_transient( STADIAREF_UPDATE_CACHE_KEY );
    if ( false !== $cached ) return $cached;

    $response = wp_remote_get( 'https://api.github.com/repos/' . STADIAREF_GITHUB_REPO . '/releases/latest', [
        'timeout' => 10,
        'headers' => [
            'Accept'     => 'application/vnd.github+json',
            'User-Agent' => 'stadiaref WordPress updater',
        ],
    ] );

    if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
        // Cache the failure for a shorter window so we don't hammer GitHub on outages.
        set_transient( STADIAREF_UPDATE_CACHE_KEY, [ 'error' => true ], 30 * MINUTE_IN_SECONDS );
        return [ 'error' => true ];
    }

    $data = json_decode( wp_remote_retrieve_body( $response ), true );
    if ( ! is_array( $data ) ) {
        set_transient( STADIAREF_UPDATE_CACHE_KEY, [ 'error' => true ], 30 * MINUTE_IN_SECONDS );
        return [ 'error' => true ];
    }

    set_transient( STADIAREF_UPDATE_CACHE_KEY, $data, STADIAREF_UPDATE_CACHE_TTL );
    return $data;
}

function stadiaref_release_zip_url( $release ) {
    if ( empty( $release['assets'] ) || ! is_array( $release['assets'] ) ) return '';
    foreach ( $release['assets'] as $asset ) {
        if ( ! empty( $asset['name'] ) && preg_match( '/^stadiaref-wp-v[\d.]+\.zip$/', $asset['name'] ) ) {
            return $asset['browser_download_url'] ?? '';
        }
    }
    return '';
}

add_filter( 'pre_set_site_transient_update_plugins', function ( $transient ) {
    if ( empty( $transient ) || ! is_object( $transient ) ) return $transient;

    $release = stadiaref_fetch_latest_release();
    if ( empty( $release ) || ! empty( $release['error'] ) ) return $transient;

    $latest = isset( $release['tag_name'] ) ? ltrim( $release['tag_name'], 'vV' ) : '';
    if ( ! $latest || version_compare( $latest, STADIAREF_VERSION, '<=' ) ) return $transient;

    $zip_url = stadiaref_release_zip_url( $release );
    if ( ! $zip_url ) return $transient;

    $plugin_file = plugin_basename( __FILE__ );
    $transient->response[ $plugin_file ] = (object) [
        'id'            => 'github.com/' . STADIAREF_GITHUB_REPO,
        'slug'          => 'stadiaref',
        'plugin'        => $plugin_file,
        'new_version'   => $latest,
        'url'           => 'https://github.com/' . STADIAREF_GITHUB_REPO,
        'package'       => $zip_url,
        'tested'        => '7.1',
        'requires'      => '5.8',
        'requires_php'  => '8.1',
        'icons'         => [ 'svg' => STADIAREF_PLUGIN_URL . 'assets/icon.svg' ],
        'banners'       => [],
        'compatibility' => new stdClass(),
    ];
    return $transient;
} );

add_filter( 'plugins_api', function ( $result, $action, $args ) {
    if ( $action !== 'plugin_information' ) return $result;
    if ( empty( $args->slug ) || $args->slug !== 'stadiaref' ) return $result;

    $release = stadiaref_fetch_latest_release();
    if ( empty( $release ) || ! empty( $release['error'] ) ) return $result;

    $latest  = isset( $release['tag_name'] ) ? ltrim( $release['tag_name'], 'vV' ) : '';
    $zip_url = stadiaref_release_zip_url( $release );

    // GitHub markdown → minimal HTML for the "View details" modal.
    $changelog_md   = $release['body'] ?? '';
    $changelog_html = $changelog_md
        ? wpautop( wp_kses_post( $changelog_md ) )
        : '<p>See the <a href="https://github.com/' . esc_attr( STADIAREF_GITHUB_REPO ) . '/releases" target="_blank" rel="noopener">GitHub releases page</a> for notes.</p>';

    return (object) [
        'name'          => 'StadiaRef',
        'slug'          => 'stadiaref',
        'version'       => $latest ?: STADIAREF_VERSION,
        'author'        => '<a href="https://seguru.digital">Seguru Digital</a>',
        'homepage'      => 'https://github.com/' . STADIAREF_GITHUB_REPO,
        'requires'      => '5.8',
        'tested'        => '7.1',
        'requires_php'  => '8.1',
        'download_link' => $zip_url,
        'trunk'         => $zip_url,
        'last_updated'  => $release['published_at'] ?? '',
        'sections'      => [
            'description' => 'An address for every part of the screen. StadiaRef shows each <code>data-ref</code> address as a label you can point at and copy.',
            'changelog'   => $changelog_html,
        ],
    ];
}, 10, 3 );

// Clear the cached release after any plugin upgrade so post-update the next
// update check sees the current installed version, not a stale cached reply.
add_action( 'upgrader_process_complete', function ( $_upgrader, $data ) {
    if ( isset( $data['type'] ) && $data['type'] === 'plugin' ) {
        delete_transient( STADIAREF_UPDATE_CACHE_KEY );
    }
}, 10, 2 );

// ── Config for the script ─────────────────────────────────────
// The settings as StadiaRef config keys, with real booleans.
function stadiaref_script_config() {
    return [
        'labels'         => stadiaref_get( 'stadiaref_labels' ),
        'startHidden'    => stadiaref_get( 'stadiaref_start_hidden' ) === '1',
        'dock'           => stadiaref_get( 'stadiaref_dock' ),
        'classConverter' => stadiaref_get( 'stadiaref_class_converter' ) === '1',
        'autoAddress'    => stadiaref_get( 'stadiaref_auto_address' ) === '1',
        'profile'        => stadiaref_get( 'stadiaref_profile' ),
    ];
}

// The inline script that hands the settings over. The page wins: a key the
// page sets in window.stadiarefConfig, or in the 2.x window.seguruDebugConfig
// (which outranked the WordPress settings in 2.x), is left to the page.
// Not wp_localize_script(): it would turn every value into a string and
// replace a window.stadiarefConfig the page has already set.
function stadiaref_inline_config( $config ) {
    return '(function (s) {'
        . 'var legacy = window.seguruDebugConfig || {};'
        . 'var names = { labels: ["labels", "defaultMode"], dock: ["dock", "position"], startHidden: ["startHidden"], classConverter: ["classConverter"], autoAddress: ["autoAddress", "autoRef", "autoRefDepth"], profile: ["profile"] };'
        . 'for (var k in names) { for (var i = 0; i < names[k].length; i++) { if (names[k][i] in legacy) { delete s[k]; break; } } }'
        . 'window.stadiarefConfig = Object.assign(s, window.stadiarefConfig || {});'
        . '})(' . wp_json_encode( $config ) . ');';
}

// ── Front-end enqueue ─────────────────────────────────────────
// Priority 20, after the 2.x plugins (priority 10), so a 2.x copy already
// on the page is seen and StadiaRef doesn't add a second.
add_action( 'wp_enqueue_scripts', function () {

    if ( stadiaref_get( 'stadiaref_enabled' ) !== '1' ) return;

    $cap = stadiaref_role_capability( stadiaref_get( 'stadiaref_min_role' ) );
    if ( ! current_user_can( $cap ) ) return;

    if ( stadiaref_old_plugin_active() || wp_script_is( 'seguru-debug-toolbar', 'enqueued' ) ) return;

    $file = STADIAREF_PLUGIN_DIR . 'assets/stadiaref.min.js';
    if ( ! file_exists( $file ) ) return;

    wp_enqueue_script(
        STADIAREF_HANDLE,
        STADIAREF_PLUGIN_URL . 'assets/stadiaref.min.js',
        [],
        STADIAREF_VERSION,
        true
    );
    wp_add_inline_script( STADIAREF_HANDLE, stadiaref_inline_config( stadiaref_script_config() ), 'before' );
}, 20 );

// ── Render settings page ──────────────────────────────────────
function stadiaref_icon_svg( $size ) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="' . (int) $size . '" height="' . (int) $size . '" aria-hidden="true" focusable="false" style="flex-shrink:0;display:block">'
        . '<defs><clipPath id="stadiaref-wp-icon"><circle cx="256" cy="256" r="256"/></clipPath></defs>'
        . '<g clip-path="url(#stadiaref-wp-icon)"><circle cx="256" cy="256" r="256" fill="#EA580C"/>'
        . '<path fill="#fff" d="M328.35,158.25c0,39.96-32.39,72.35-72.35,72.35s-72.35-32.39-72.35-72.35,32.39-72.35,72.35-72.35,72.35,32.39,72.35,72.35M141.19,624.36h0v520.12c0,69.87,30.78,120.8,92.17,128.41v63.09h44.33v-63.09c61.39-7.61,92.17-58.54,92.17-128.41V480.38c0-50.17-16.33-91-46.67-112,14-17.5,29.17-31.49,29.17-57.78,0-17.25-4.37-38.67-26.63-58.37,28.72-21.35,47.41-55.43,47.41-93.97,0-64.7-52.45-117.15-117.15-117.15s-117.15,52.45-117.15,117.15,52.45,117.15,117.15,117.15c8.86,0,17.46-1.07,25.75-2.93,12.7,9.57,20.26,21.05,21.32,31.55,2.55,25.37-19.72,42.73-59.21,83.02-59.5,61.84-77,81.67-87.5,109.67-11.67,28-15.17,65.33-15.17,112v15.65h0Z M185.52,1105.92h0v-513.54c0-77,23.33-102.67,88.67-171.51,4.67-5.83,10.5-11.67,17.5-18.67,25.67,15.17,33.83,50.17,33.83,110.84v598.76c0,81.67-14,117.84-70,117.84s-70-36.17-70-117.84v-5.88h0Z"/></g></svg>';
}

function stadiaref_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;

    $enabled         = stadiaref_get( 'stadiaref_enabled' );
    $labels          = stadiaref_get( 'stadiaref_labels' );
    $start_hidden    = stadiaref_get( 'stadiaref_start_hidden' );
    $dock            = stadiaref_get( 'stadiaref_dock' );
    $min_role        = stadiaref_get( 'stadiaref_min_role' );
    $profile         = stadiaref_get( 'stadiaref_profile' );
    $class_converter = stadiaref_get( 'stadiaref_class_converter' );
    $auto_address    = stadiaref_get( 'stadiaref_auto_address' );

    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'StadiaRef', 'stadiaref' ); ?></h1>

        <form method="post" action="options.php">
            <?php settings_fields( STADIAREF_OPTION_GROUP ); ?>

            <style>
                .stadiaref-card { background: #fff; border: 1px solid #C3C4C7; padding: 16px; margin: 0 0 12px; max-width: 880px; }
                .stadiaref-card h2 { font-size: 14px; font-weight: 600; margin: 0 0 10px; padding: 0; }
                .stadiaref-card__head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
                .stadiaref-card__head h2 { margin: 0; }
                .stadiaref-new { padding: 1px 7px; border-radius: 999px; background: #FFF7ED; color: #9A3412; border: 1px solid rgba(234,88,12,0.5); font-size: 11px; font-weight: 600; }
                .stadiaref-desc { margin: 6px 0 0; color: #50575E; }
                .stadiaref-field { margin-top: 16px; }
                .stadiaref-field:first-of-type { margin-top: 0; }
                .stadiaref-field__label { display: block; font-weight: 600; margin-bottom: 6px; }
                .stadiaref-radios { display: flex; flex-direction: column; gap: 6px; }
                .stadiaref-radios label { display: flex; align-items: center; gap: 6px; }
                .stadiaref-help p { margin: 0 0 8px; }
                .stadiaref-footer { display: flex; align-items: center; gap: 8px; padding-top: 16px; margin-top: 8px; border-top: 1px solid #DCDCDE; color: #50575E; max-width: 880px; }
            </style>

            <!-- Status -->
            <div class="stadiaref-card">
                <h2><?php esc_html_e( 'Status', 'stadiaref' ); ?></h2>
                <label>
                    <input type="checkbox" name="stadiaref_enabled" value="1" <?php checked( $enabled, '1' ); ?>>
                    <strong><?php esc_html_e( 'Enable StadiaRef', 'stadiaref' ); ?></strong>
                </label>
                <p class="stadiaref-desc"><?php esc_html_e( 'Loads the toolbar on the front end for signed-in users who meet the access rule below. Visitors never see it.', 'stadiaref' ); ?></p>
            </div>

            <!-- Display -->
            <div class="stadiaref-card">
                <h2><?php esc_html_e( 'Display', 'stadiaref' ); ?></h2>
                <div class="stadiaref-field">
                    <span class="stadiaref-field__label"><?php esc_html_e( 'Default labels', 'stadiaref' ); ?></span>
                    <div class="stadiaref-radios">
                        <?php
                        $label_choices = [
                            'full'  => __( '<strong>Full.</strong> Every address shown. Best for QA.', 'stadiaref' ),
                            'icons' => __( '<strong>Icons.</strong> A dot on each element. Hover to read the address.', 'stadiaref' ),
                            'off'   => __( '<strong>Off.</strong> Labels start hidden. Press <kbd>L</kbd> to show them.', 'stadiaref' ),
                        ];
                        foreach ( $label_choices as $val => $text ) :
                        ?>
                            <label>
                                <input type="radio" name="stadiaref_labels" value="<?php echo esc_attr( $val ); ?>" <?php checked( $labels, $val ); ?>>
                                <span><?php echo wp_kses( $text, [ 'strong' => [], 'kbd' => [] ] ); ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="stadiaref-field">
                    <label>
                        <input type="checkbox" name="stadiaref_start_hidden" value="1" <?php checked( $start_hidden, '1' ); ?>>
                        <?php echo wp_kses( __( 'Start hidden. Press <kbd>D</kbd> to show the toolbar.', 'stadiaref' ), [ 'kbd' => [] ] ); ?>
                    </label>
                </div>

                <div class="stadiaref-field">
                    <span class="stadiaref-field__label"><?php esc_html_e( 'Position', 'stadiaref' ); ?></span>
                    <div class="stadiaref-radios">
                        <?php
                        $docks = [
                            'bottom-right' => __( 'Bottom right', 'stadiaref' ),
                            'bottom-left'  => __( 'Bottom left', 'stadiaref' ),
                            'top-right'    => __( 'Top right', 'stadiaref' ),
                            'top-left'     => __( 'Top left', 'stadiaref' ),
                        ];
                        foreach ( $docks as $val => $text ) :
                        ?>
                            <label>
                                <input type="radio" name="stadiaref_dock" value="<?php echo esc_attr( $val ); ?>" <?php checked( $dock, $val ); ?>>
                                <?php echo esc_html( $text ); ?>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Access -->
            <div class="stadiaref-card">
                <h2><?php esc_html_e( 'Access', 'stadiaref' ); ?></h2>
                <label class="stadiaref-field__label" for="stadiaref_min_role"><?php esc_html_e( 'Minimum role', 'stadiaref' ); ?></label>
                <select name="stadiaref_min_role" id="stadiaref_min_role">
                    <?php
                    $roles = [
                        'administrator' => __( 'Administrator', 'stadiaref' ),
                        'editor'        => __( 'Editor', 'stadiaref' ),
                        'author'        => __( 'Author', 'stadiaref' ),
                    ];
                    foreach ( $roles as $val => $text ) :
                    ?>
                        <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $min_role, $val ); ?>><?php echo esc_html( $text ); ?></option>
                    <?php endforeach; ?>
                </select>
                <p class="stadiaref-desc"><?php esc_html_e( 'Users with this role or higher see the toolbar. Subscribers and customers never do.', 'stadiaref' ); ?></p>
            </div>

            <!-- Addresses -->
            <div class="stadiaref-card">
                <div class="stadiaref-card__head">
                    <h2><?php esc_html_e( 'Addresses', 'stadiaref' ); ?></h2>
                    <span class="stadiaref-new"><?php esc_html_e( 'New in 3.0', 'stadiaref' ); ?></span>
                </div>
                <label class="stadiaref-field__label" for="stadiaref_profile"><?php esc_html_e( 'Address profile', 'stadiaref' ); ?></label>
                <select name="stadiaref_profile" id="stadiaref_profile">
                    <?php
                    $profiles = [
                        'generic' => __( 'Generic', 'stadiaref' ),
                        'titan'   => __( 'Titan', 'stadiaref' ),
                        'app'     => __( 'App', 'stadiaref' ),
                    ];
                    foreach ( $profiles as $val => $text ) :
                    ?>
                        <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $profile, $val ); ?>><?php echo esc_html( $text ); ?></option>
                    <?php endforeach; ?>
                </select>
                <p class="stadiaref-desc"><?php esc_html_e( 'The grammar StadiaRef uses to sort addresses into section, block and element. Generic accepts any lower-case address and reads the tier from nesting. Titan is for Foundations. App is for product, surface and screen addresses.', 'stadiaref' ); ?></p>
            </div>

            <!-- Page builders -->
            <div class="stadiaref-card">
                <h2><?php esc_html_e( 'Page builders', 'stadiaref' ); ?></h2>
                <div class="stadiaref-field">
                    <label>
                        <input type="checkbox" name="stadiaref_class_converter" value="1" <?php checked( $class_converter, '1' ); ?>>
                        <strong><?php esc_html_e( 'Class-to-ref converter', 'stadiaref' ); ?></strong>
                    </label>
                    <p class="stadiaref-desc"><?php echo wp_kses( __( 'Turns a CSS class that starts with <code>dataref-</code> into a <code>data-ref</code> attribute. Works in every builder, free tiers included.', 'stadiaref' ), [ 'code' => [] ] ); ?></p>
                </div>
                <div class="stadiaref-field">
                    <label>
                        <input type="checkbox" name="stadiaref_auto_address" value="1" <?php checked( $auto_address, '1' ); ?>>
                        <strong><?php esc_html_e( 'Auto-address', 'stadiaref' ); ?></strong>
                    </label>
                    <p class="stadiaref-desc"><?php esc_html_e( 'Gives every section, block and element without an authored address a temporary one from the page slug and position. Temporary addresses show with a dashed AUTO label. Pick which tiers you see with Show on the toolbar.', 'stadiaref' ); ?></p>
                </div>
            </div>

            <!-- How it works -->
            <div class="stadiaref-card stadiaref-help">
                <h2><?php esc_html_e( 'How it works', 'stadiaref' ); ?></h2>
                <p><?php echo wp_kses( __( '<strong>Keys.</strong> <kbd>D</kbd> shows or hides the toolbar. <kbd>L</kbd> cycles labels. <kbd>1</kbd>, <kbd>2</kbd> and <kbd>3</kbd> switch sections, blocks and elements. <kbd>P</kbd> starts Pick. <kbd>/</kbd> opens Find. <kbd>O</kbd> cycles Outline. <kbd>Esc</kbd> leaves Pick or Find, then hides everything. Keys pause while you type in a field.', 'stadiaref' ), [ 'strong' => [], 'kbd' => [] ] ); ?></p>
                <p><?php echo wp_kses( __( '<strong>Click to copy.</strong> Click any label to copy its address.', 'stadiaref' ), [ 'strong' => [] ] ); ?></p>
                <p><?php echo wp_kses( __( '<strong>What an address is.</strong> Each tagged part of the page carries a short code such as <code>home-hero</code>. Paste it into a note or a ticket and a developer finds the exact element.', 'stadiaref' ), [ 'strong' => [], 'code' => [] ] ); ?></p>
                <p style="margin:0"><a href="https://github.com/segurudigital/stadiaref" target="_blank" rel="noopener"><?php esc_html_e( 'Read the docs on GitHub', 'stadiaref' ); ?></a></p>
            </div>

            <?php submit_button(); ?>
        </form>

        <div class="stadiaref-footer">
            <?php echo stadiaref_icon_svg( 16 ); // phpcs:ignore WordPress.Security.EscapeOutput -- fixed markup ?>
            <span><?php
                printf(
                    /* translators: %s: link to Seguru Digital */
                    esc_html__( 'StadiaRef by %s', 'stadiaref' ),
                    '<a href="https://seguru.digital" target="_blank" rel="noopener">Seguru Digital</a>'
                );
            ?></span>
            <span style="margin-left:auto;font-size:11px">v<?php echo esc_html( STADIAREF_VERSION ); ?></span>
        </div>
    </div>
    <?php
}
