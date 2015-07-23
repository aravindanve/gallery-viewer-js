// gallery viewer and light box plugin
// Aravindan Ve - 201503221208PM

(function setup_gallery_viewer ($, win) {
    // exit if jquery not available
    if (typeof $ != 'function') {
        console.log("Error: jQuery Required");
        return false;
    }

    if (typeof win.GalleryViewer != 'object')
        win.GalleryViewer = {};

    // default settings 
    var def_settings = {
        'class_name':               'lightbox-8675896',
        'gallery_name':             'gallery',
        'apply_styles':             true,
        'large_image_suffix':       'original',
        'resource_path':            false,
        'previous_button_image':    'previous_button.png',
        'next_button_image':        'next_button.png',
        'close_button_inner':       'x',
        'use_generic_styles':       true,
        'save_on_leave':            true,
    };

    // load settings
    if (typeof win.GalleryViewer.settings != 'object')
        win.GalleryViewer.settings = def_settings;
    else {
        for (key in def_settings) 
            if (def_settings.hasOwnProperty(key)) {
            if (typeof win.GalleryViewer.settings[key] == 'undefined')
                win.GalleryViewer.settings[key] = def_settings[key];
        }
    }

    // functions
    win.GalleryViewer.fn = {
        reload: function() {
            return load_gv();
        },
    };

    // inject generic styles
    if (win.GalleryViewer.settings.use_generic_styles) {
        var gallery = $("." + win.GalleryViewer.settings.gallery_name);
        if (gallery.length) gallery.append('<style>' +
            '.gallery {\
                padding-top: 0px;\
            }\
            .gallery-image {\
                position: relative;\
                float: left;\
                width: 200px;\
                height: 200px;\
                overflow: hidden;\
                border: #999 solid 1px;\
                margin-left: 16px;\
                margin-bottom: 10px;\
                background-color: #aaa;\
                cursor: pointer;\
            }\
            .gallery-image-overlay {\
                position: absolute;\
                top: 0;\
                left: 0;\
                right: 0;\
                bottom: 0;\
                background-color: #000;\
                opacity: 0.1;\
                display: none;\
            }\
            .gallery-image:hover .gallery-image-overlay {\
                display: block;\
            }\
            .gallery-image img {\
                width: 100%;\
            }\
            .gallery-image .gv-video, .gallery-image .gv-audio {\
                display: none;\
            }\
            .img-title {\
                text-transform: capitalize;\
            }\
            .img-title, .img-description, .img-like {\
                position: relative;\
                float: none;\
                padding: 6px 15px 0px 15px; \
                word-break: break-all;\
            }\
            .img-comment {\
                position: relative;\
                float: none;\
                padding: 10px 15px;\
                word-break: break-all;\
            }\
            .img-title {\
                font-size: 16px;\
            }\
            .img-description {\
                font-size: 14px;\
                color: #888;\
            }\
            .img-comment {\
            }\
            .img-newcomment {\
                width: 99%;\
                border-top: #ddd solid 1px;\
            }\
            .img-newcomment textarea {\
                position: relative;\
                float: none;\
                padding: 10px 15px;\
                box-sizing: border-box;\
                border: none;\
                width: 100%;\
                min-width: 100%;\
                max-width: 100%;\
                height: 60px;\
                min-height: 60px;\
                max-height: 60px;\
                font-family: sans-serif;\
                outline: none;\
                box-shadow: none;\
            }\
            ' +
            '</style>');
    }

    function load_gv() {
        // copy settings to local variable
        var l = win.GalleryViewer.settings;

        // create light box
        var overlay = 
            '<div class="' +
            l.class_name +
            '-overlay"' + 
            (l.apply_styles? ' ' + 
                'style="\
                position: fixed;\
                top: 0;\
                left: 0;\
                right: 0;\
                bottom: 0;\
                background-color: #000;\
                opacity: 0.6;\
                z-index: 9990;\
                display: none;\
                "' : '') + 
            '></div>';

        // append overlay
        $('.' + l.class_name + '-overlay').remove();
        $("body").append(overlay);

        var popup = 
            '<div class="' +
            l.class_name +
            '"' + 
            (l.apply_styles? ' ' + 
                'style="\
                position: fixed;\
                top: 0;\
                left: 0;\
                right: 0;\
                bottom: 0;\
                background: none;\
                z-index: 9999;\
                pointer-events: none;\
                display: none;\
                "' : '') + 
            '>\
                <div class="vert-align"' + 
                (l.apply_styles? ' ' + 
                    'style="\
                    position: absolute;\
                    top: 0;\
                    left: 0;\
                    right: 0;\
                    height: 50%;\
                    "' : '') + 
                '>\
                    <div class="real-lightbox"' + 
                    (l.apply_styles? ' ' + 
                        'style = "\
                        position: relative;\
                        float: none;\
                        top: 100%;\
                        margin-top: -290px;\
                        margin-right: auto;\
                        margin-left: auto;\
                        width: 980px;\
                        height: 580px;\
                        background-color: #fff;\
                        font-family: sans-serif;\
                        pointer-events: auto;\
                        "' : '') +
                    '>\
                        <div class="image-area"' + 
                        (l.apply_styles? ' ' + 
                            'style="\
                            position: absolute;\
                            top: 0;\
                            left: 0;\
                            bottom: 0;\
                            width: 680px;\
                            background-color: #000;\
                            overflow: hidden;\
                            "' : '') + 
                        '>\
                            <div class="image-area-image"' + 
                            (l.apply_styles? ' ' + 
                                'style="\
                                position: absolute;\
                                top: 0;\
                                left: 0;\
                                right: 0;\
                                bottom: 0;\
                                overflow: hidden;\
                                background-repeat: no-repeat;\
                                background-position: center;\
                                background-size: contain;\
                                "' : '') + 
                            '></div>\
                            <div class="image-area-previous"' + 
                            (l.apply_styles? ' ' + 
                                'style="\
                                position: absolute;\
                                top: 0;\
                                left: 0;\
                                bottom: 0;\
                                color: #fff;\
                                width: 60px;\
                                cursor: pointer;\
                                text-align: center;\
                                ' + (l.resource_path?
                                    'background: url(\'' + 
                                        l.resource_path.replace(/\/$/, '') + '/' + 
                                        l.previous_button_image + '\')\
                                        no-repeat center;':'') + '\
                                background-size: contain;\
                                "' : '') + 
                            '></div>\
                            <div class="image-area-next"' + 
                            (l.apply_styles? ' ' + 
                                'style="\
                                position: absolute;\
                                top: 0;\
                                right: 0;\
                                bottom: 0;\
                                color: #fff;\
                                width: 60px;\
                                cursor: pointer;\
                                text-align: center;\
                                background-repeat: no-repeat;\
                                background-position: center;\
                                background-size: contain;\
                                ' + (l.resource_path?
                                    'background: url(\'' + 
                                        l.resource_path.replace(/\/$/, '') + '/' + 
                                        l.next_button_image + '\')\
                                        no-repeat center;':'') + '\
                                background-size: contain;\
                                "' : '') + 
                            '></div>\
                        </div>\
                        <div class="content-area"' + 
                        (l.apply_styles? ' ' + 
                            'style="\
                            position: absolute;\
                            top: 0;\
                            right: 0;\
                            bottom: 0;\
                            width: 300px;\
                            "' : '') + 
                        '>\
                            <div class="close-button"' +
                            (l.apply_styles? ' ' + 
                                'style="\
                                position: absolute;\
                                top: 0;\
                                right: 0;\
                                width: 26px;\
                                height: 26px;\
                                line-height: 26px;\
                                cursor: pointer;\
                                text-align: center;\
                                margin-left: auto;\
                                "' : '') + 
                            '>' + l.close_button_inner + '</div>\
                            <div class="inserted"' + 
                            (l.apply_styles? ' ' +
                                'style="\
                                position: absolute;\
                                top: 0;\
                                left: 0;\
                                right: 0;\
                                bottom: 0;\
                                margin-top: 30px;\
                                border-top: #f6f6f6 solid 1px;\
                                overflow-y: auto;\
                                overflow-x: hidden;\
                                "' : '') + 
                            '></div>\
                            <div class="content-area-inner"></div>\
                        </div>\
                    </div>\
                </div>\
            </div>';

        // append popup
        $('.' + l.class_name).remove();
        $("body").append(popup);

        var popup_selector = "." + l.class_name;
        var overlay_selector = popup_selector + "-overlay";
        // setup popup actions
        function show_popup() {
            $(overlay_selector).css({"display" : "block"});
            $(popup_selector).css({"display" : "block"});
            $("body").on("keydown", popup_key_action);
            $("body").css({"overflow" : "hidden"});
        }
        function hide_popup() {
            $(overlay_selector).css({"display" : "none"});
            $(popup_selector).css({"display" : "none"});
            $("body").unbind("keydown", popup_key_action);
            $("body").css({"overflow" : ""});
            // pause all video
        }

        function popup_key_action(event) {
            if (event.keyCode === 27) hide_popup(); // esc
            if (event.keyCode === 37) go_previous(); // <-
            if (event.keyCode === 39) go_next(); // ->
            if ((event.keyCode === 38) || 
                (event.keyCode === 40)) hide_popup(); // up or down

        }

        function open_image_on_event(event) {
            var targ = $(event.target);
            var elem = null;
            if (targ.hasClass("gallery-viewer-image"))
                elem = targ;
            else {
                elem = targ.parents(".gallery-viewer-image");
            }
            if (!elem.length) return false;
            open_image(elem);
        }

        function open_image(elem, navigate) {
            // navigate moves to an image without opening/closing popup
            if (navigate != true) navigate = false;

            var popup = $(popup_selector).children(".vert-align").children(".real-lightbox");
            var last_index = popup.data("gv-index");
            // load index
            popup.data("gv-index", elem.data("gallery-viewer-index"));

            // save inserted
            if (l.save_on_leave) {
                var old_elem = null;
                $(".gallery-viewer-image").each(function() {
                    if ($(this).data("gallery-viewer-index") == last_index + '') 
                        old_elem = $(this);
                });
                if (old_elem && old_elem.length) {
                    var main_content = popup.find('.image-area-image');
                    // put back loaded content
                    if (main_content.children().length) {
                        var tbpb_wrapper = main_content.children().first().prop('data-wrapper');
                        if (tbpb_wrapper && old_elem.find('.' + tbpb_wrapper).length) {
                            old_elem.find('.' + tbpb_wrapper)
                                .prepend(main_content.children().first().removeAttr('data-wrapper'));
                        }
                    }
                    // save changes
                    old_elem.find(".gallery-viewer-image-content")
                        .empty().append(popup.find(".inserted").html());
                }
            }

            // load data
            if (typeof elem.data() == 'object') {
                var data_attrs = elem.data();
                for (key in data_attrs) 
                    if (key != 'gallery-viewer-index')
                    if (data_attrs.hasOwnProperty(key)) {
                        popup.data(key, data_attrs[key]);
                        console.log(key, data_attrs[key]);
                        console.log(popup.data("image-id"));
                }
            }
            // load image or video
            var main_content = elem.find('.gv-video, .gv-audio');
            if (main_content.length) {
                var $tbi = main_content.children().first();
                var tbi_wrapper = main_content.hasClass('gv-video') ? 
                    'gv-video' : main_content.hasClass('gv-audio') ? 'gv-audio' : '';
                $tbi.prop('data-wrapper', tbi_wrapper);
                popup.find('.image-area-image').css({'background-image':''})
                    .empty().append($tbi);

            } else {
                // load image
                popup.find(".image-area-image").css({
                    'background-image': "url('" + 
                        elem.find("img.showcase-image").prop("src")
                            .replace(/(\.[^\s\r\n\t\.]*)$/, 
                                l.large_image_suffix + "$1") + "')",
                }).empty();
            }

            // load info & comments
            popup.find(".inserted").empty()
                .append(elem.find(".gallery-viewer-image-content").html());

            // bottom anchored content
            popup.find(".bottom-box").remove();
            if (elem.find(".gallery-viewer-image-content-bottom").length) {
                var bottom_markup = 
                    '<div class="bottom-box"' + 
                    (l.apply_styles? ' ' +
                        'style="\
                        position: absolute;\
                        bottom: 0;\
                        width: 100%;\
                        "': '') + '>' + 
                    elem.find(".gallery-viewer-image-content-bottom").html() + 
                    '</div>';
                popup.find(".content-area").append(bottom_markup);
            }

            // show popup
            if (!navigate) show_popup();

            // offset comments
            if (popup.find(".bottom-box").length) {
                popup.find(".inserted").css({
                    'margin-bottom' : 
                        popup.find(".bottom-box")[0].offsetHeight + 'px'});
            } else {
                popup.find(".inserted").css({'margin-bottom' : '0'});
            }

            // reset scroll top
            popup.find(".inserted").scrollTop(0);

            // turn navigation buttons on or off
            var current_gv_index = popup.data("gv-index");
            // is left arrow allowed
            var l_elem_exists = false;
            $(".gallery-viewer-image").each(function() {
                if ($(this).data("gallery-viewer-index") == (current_gv_index-1) + '') 
                    l_elem_exists = true;
            });
            if (l_elem_exists) 
                popup.find(".image-area-previous").css({"display": ""});
            else 
                popup.find(".image-area-previous").css({"display": "none"});
            // is right arrow allowed
            var r_elem_exists = false;
            $(".gallery-viewer-image").each(function() {
                if ($(this).data("gallery-viewer-index") == (current_gv_index+1) + '') 
                    r_elem_exists = true;
            });
            if (r_elem_exists) 
                popup.find(".image-area-next").css({"display": ""});
            else 
                popup.find(".image-area-next").css({"display": "none"});
        }

        function go_previous(e) {
            var gv_index = $(".real-lightbox").first().data("gv-index");
            gv_index--;
            var elem = null;
            $(".gallery-viewer-image").each(function() {
                if ($(this).data("gallery-viewer-index") == gv_index + '') elem = $(this);
            });
            if (!elem) return false; 
            open_image(elem, true);
        }

        function go_next(e) {
            var gv_index = $(".real-lightbox").first().data("gv-index");
            gv_index++;
            var elem = null;
            $(".gallery-viewer-image").each(function() {
                if ($(this).data("gallery-viewer-index") == gv_index + '') elem = $(this);
            });
            if (!elem) return false;
            open_image(elem, true);
        }

        // overlay click
        $(overlay_selector).unbind("click", hide_popup);
        $(overlay_selector).on("click", hide_popup);

        // close
        $(popup_selector).find(".close-button").unbind("click", hide_popup);
        $(popup_selector).find(".close-button").on("click", hide_popup);

        // previous and next
        $(popup_selector).find(".image-area-previous").unbind("click", go_previous);
        $(popup_selector).find(".image-area-previous").on("click", go_previous);
        $(popup_selector).find(".image-area-next").unbind("click", go_next);
        $(popup_selector).find(".image-area-next").on("click", go_next);

        // set up light box for gallery images
        var images = $(".gallery-viewer-image");

        var image_length = 0;
        images.each(function() {
            var elem = $(this);
            // bind lightbox
            elem.unbind("click");
            elem.on("click", open_image_on_event);

            // index images 
            elem.data("gallery-viewer-index", image_length);
            // doesnt physically set data 

            image_length++;
        });
        console.log("loaded");
        console.log(image_length);
    } // end of gv load
    $(document).ready(load_gv); // end of window ready

})((typeof jQuery != 'undefined'? jQuery : null), window);



