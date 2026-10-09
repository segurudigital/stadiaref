<?php
/**
 * Plugin Name: StadiaRef (mu-plugin)
 * Description: An address for every part of the screen. Shows each data-ref address as a label you can point at and copy. Lightweight mu-plugin drop-in.
 * Version:     3.1.0
 * Author:      Seguru Digital
 * Author URI:  https://seguru.digital
 * Text Domain: stadiaref
 *
 * Drop this file into wp-content/mu-plugins/ (create the folder if it doesn't exist).
 * Then copy stadiaref.min.js into wp-content/mu-plugins/stadiaref/
 *
 * This mu-plugin reads the same options as the installable plugin, so the
 * Settings → StadiaRef page sets both if the plugin is installed too. Settings
 * from Seguru Debug Toolbar 2.x are copied over once. With no settings it
 * defaults to: enabled=off, labels=full, start hidden (press D to reveal),
 * dock=bottom-right, role=administrator, profile=generic.
 *
 * Enable via WP-CLI:  wp option update stadiaref_enabled 1
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Settings carried over from Seguru Debug Toolbar 2.x, once. The installable
// plugin has the same function; whichever loads first defines it.
if ( ! function_exists( 'stadiaref_migrate_2x' ) ) {
    function stadiaref_migrate_2x() {
        if ( get_option( 'stadiaref_migrated_2x' ) ) return;
        $labels  = [ '2' => 'full', '0' => 'icons', '1' => 'off' ];
        $choices = [
            'stadiaref_dock'     => [ 'bottom-right', 'bottom-left', 'top-right', 'top-left' ],
            'stadiaref_min_role' => [ 'administrator', 'editor', 'author' ],
        ];
        $map = [
            'stadiaref_enabled'         => 'sdt_enabled',
            'stadiaref_labels'          => 'sdt_default_mode',
            'stadiaref_start_hidden'    => 'sdt_start_hidden',
            'stadiaref_dock'            => 'sdt_position',
            'stadiaref_min_role'        => 'sdt_min_role',
            'stadiaref_class_converter' => 'sdt_class_converter',
            'stadiaref_auto_address'    => 'sdt_auto_ref',
        ];
        foreach ( $map as $new => $old ) {
            $value = get_option( $old, null );
            if ( $value === null || $value === false ) continue;
            if ( get_option( $new, null ) !== null ) continue;
            $value = (string) $value;
            if ( $new === 'stadiaref_labels' ) {
                if ( ! isset( $labels[ $value ] ) ) continue;
                $value = $labels[ $value ];
            } elseif ( isset( $choices[ $new ] ) ) {
                if ( ! in_array( $value, $choices[ $new ], true ) ) continue;
            } else {
                $value = $value === '1' ? '1' : '0';
            }
            add_option( $new, $value );
        }
        update_option( 'stadiaref_migrated_2x', '3.1.0' );
    }
}
add_action( 'admin_init', 'stadiaref_migrate_2x' );

add_action( 'wp_enqueue_scripts', function () {

    // An mu-plugin loads before plugins; let the copy step run on the front
    // end too, so a site whose admins never visit wp-admin still moves over.
    stadiaref_migrate_2x();

    if ( get_option( 'stadiaref_enabled', '0' ) !== '1' ) return;

    // Role → capability mapping
    $role_caps = [
        'administrator' => 'manage_options',
        'editor'        => 'edit_others_posts',
        'author'        => 'publish_posts',
    ];
    $min_role = get_option( 'stadiaref_min_role', 'administrator' );
    $cap      = $role_caps[ $min_role ] ?? 'manage_options';
    if ( ! current_user_can( $cap ) ) return;

    // Seguru Debug Toolbar 2.x still active: don't add a second copy.
    if ( defined( 'SDT_VERSION' ) || wp_script_is( 'seguru-debug-toolbar', 'enqueued' ) ) return;
    // The installable plugin enqueues the same handle; one copy is enough.
    if ( wp_script_is( 'stadiaref', 'enqueued' ) ) return;

    // Look for the JS file next to this plugin file
    $file = __DIR__ . '/stadiaref/stadiaref.min.js';
    $url  = plugin_dir_url( __FILE__ ) . 'stadiaref/stadiaref.min.js';

    // Fallback: the npm package in the active theme.
    if ( ! file_exists( $file ) ) {
        $rel        = '/node_modules/stadiaref/dist/stadiaref.min.js';
        $theme_path = get_stylesheet_directory() . $rel;
        if ( file_exists( $theme_path ) ) {
            $file = $theme_path;
            $url  = get_stylesheet_directory_uri() . $rel;
        }
    }

    if ( ! file_exists( $file ) ) return;

    wp_enqueue_script( 'stadiaref', $url, [], filemtime( $file ), true );

    $config = [
        'labels'         => get_option( 'stadiaref_labels', 'full' ),
        'startHidden'    => get_option( 'stadiaref_start_hidden', '1' ) === '1',
        'dock'           => get_option( 'stadiaref_dock', 'bottom-right' ),
        'classConverter' => get_option( 'stadiaref_class_converter', '0' ) === '1',
        'autoAddress'    => get_option( 'stadiaref_auto_address', '0' ) === '1',
        'profile'        => get_option( 'stadiaref_profile', 'generic' ),
    ];
    // The page wins: keys it sets in window.stadiarefConfig, or in the 2.x
    // window.seguruDebugConfig, are left to it. Booleans stay booleans.
    wp_add_inline_script( 'stadiaref', '(function (s) {'
        . 'var legacy = window.seguruDebugConfig || {};'
        . 'var names = { labels: ["labels", "defaultMode"], dock: ["dock", "position"], startHidden: ["startHidden"], classConverter: ["classConverter"], autoAddress: ["autoAddress", "autoRef", "autoRefDepth"], profile: ["profile"] };'
        . 'for (var k in names) { for (var i = 0; i < names[k].length; i++) { if (names[k][i] in legacy) { delete s[k]; break; } } }'
        . 'window.stadiarefConfig = Object.assign(s, window.stadiarefConfig || {});'
        . '})(' . wp_json_encode( $config ) . ');', 'before' );
}, 20 );
