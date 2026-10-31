/*
 * Material 3 Expressive UI Kit for Oracle APEX Universal Theme 1.0.0: light and dark mode
 * TechRevX, MIT License - https://github.com/aamirkhanz/apex-material-expressive-ui-kit
 *
 * The look is in material-expressive.css; this file only switches between light and dark. Without it the kit stays light,
 * or follows a class you set yourself: <html class="me-dark"> for dark.
 *
 * To avoid a flash of the wrong mode, put this in the page template's or application's HTML header
 * (Shared Components > User Interface > JavaScript > Function and Global Variable Declaration is too late):
 *   <script>(function(d){var m;try{m=localStorage.getItem("me-mode")}catch(e){}
 *   if(m!=="dark"&&m!=="light")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
 *   d.documentElement.classList.add("me-"+m)})(document);</script>
 *
 * API (window.materialExpressive):
 *   getMode()                         "light" or "dark"
 *   setMode( "light" | "dark" | "auto", { save: true } )
 *                                     "auto" follows the operating system; the choice is kept in localStorage "me-mode"
 *                                     unless save is false
 *   toggle()                          switches light and dark and keeps the choice
 * Buttons or links with the attribute data-me-mode-toggle switch the mode when clicked; their aria-label, title and a
 * .fa icon (fa-moon-o / fa-sun-o) describe what they do next.
 * <html> fires "me-modechange" with detail { mode } after a change.
 */
( function() {
    "use strict";

    const KEY = "me-mode",
        root = document.documentElement,
        media = window.matchMedia ? window.matchMedia( "(prefers-color-scheme: dark)" ) : null;

    const system = () => media && media.matches ? "dark" : "light";
    const current = () => root.classList.contains( "me-dark" ) ? "dark" : "light";

    function saved() {
        try {
            const v = localStorage.getItem( KEY );
            return v === "light" || v === "dark" || v === "auto" ? v : null;
        } catch ( e ) {
            return null;
        }
    }

    function save( v ) {
        try { localStorage.setItem( KEY, v ); } catch ( e ) { /* not kept, still switched */ }
    }

    function sync() {
        const dark = current() === "dark", label = dark ? "Switch to light mode" : "Switch to dark mode";
        document.querySelectorAll( "[data-me-mode-toggle]" ).forEach( b => {
            b.setAttribute( "aria-label", label );
            b.title = label;
            const icon = b.querySelector( ".fa" );
            if ( icon ) {
                icon.classList.toggle( "fa-moon-o", !dark );
                icon.classList.toggle( "fa-sun-o", dark );
            }
        } );
    }

    function apply( mode ) {
        const changed = mode !== current() || !root.classList.contains( "me-" + mode );
        root.classList.toggle( "me-dark", mode === "dark" );
        root.classList.toggle( "me-light", mode === "light" );
        sync();
        if ( changed ) { root.dispatchEvent( new CustomEvent( "me-modechange", { detail: { mode } } ) ); }
    }

    window.materialExpressive = {
        getMode: current,
        setMode( mode, options ) {
            if ( mode !== "light" && mode !== "dark" && mode !== "auto" ) { return; }
            if ( !options || options.save !== false ) { save( mode ); }
            apply( mode === "auto" ? system() : mode );
        },
        toggle() { window.materialExpressive.setMode( current() === "dark" ? "light" : "dark" ); }
    };

    // the operating system's setting counts while the choice is "auto" or nothing was chosen
    if ( media && media.addEventListener ) {
        media.addEventListener( "change", () => {
            const s = saved();
            if ( !s || s === "auto" ) { apply( system() ); }
        } );
    }
    // no early snippet and no class of your own: use the saved choice or the operating system
    if ( !root.classList.contains( "me-dark" ) && !root.classList.contains( "me-light" ) ) {
        const s = saved();
        apply( s === "light" || s === "dark" ? s : system() );
    }

    // remember whether the last input was a pointer: some widgets focus from script, and the CSS shows their
    // focus ring only for keyboard use (html.me-pointer)
    document.addEventListener( "pointerdown", () => root.classList.add( "me-pointer" ), true );
    document.addEventListener( "keydown", () => root.classList.remove( "me-pointer" ), true );

    document.addEventListener( "click", e => {
        const b = e.target.closest && e.target.closest( "[data-me-mode-toggle]" );
        if ( b ) {
            e.preventDefault();
            window.materialExpressive.toggle();
        }
    } );

    if ( document.readyState === "loading" ) {
        document.addEventListener( "DOMContentLoaded", sync );
    } else {
        sync();
    }
} )();
