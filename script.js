

$(function () {
    // Temporary storage for elements
    let elementData = {};
    let backgroundColor = "";
    const _ELEMENT_DATA = "ELEMENT_DATA";
    const _POPUP_BACKGROUND = "POPUP_BACKGROUND";
    const CLOSE_BUTTON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_711_4145)">
                            <path d="M12.94 12L18.4667 6.47329C18.5759 6.34576 18.633 6.18171 18.6265 6.01393C18.62 5.84614 18.5504 5.68698 18.4317 5.56825C18.313 5.44952 18.1538 5.37997 17.986 5.37349C17.8183 5.36701 17.6542 5.42408 17.5267 5.53329L12 11.06L6.47334 5.52663C6.3478 5.40109 6.17754 5.33057 6 5.33057C5.82247 5.33057 5.6522 5.40109 5.52667 5.52663C5.40113 5.65216 5.33061 5.82243 5.33061 5.99996C5.33061 6.1775 5.40113 6.34776 5.52667 6.47329L11.06 12L5.52667 17.5266C5.45688 17.5864 5.4002 17.6599 5.36019 17.7426C5.32017 17.8254 5.29768 17.9154 5.29414 18.0073C5.29059 18.0991 5.30606 18.1906 5.33958 18.2762C5.37309 18.3617 5.42393 18.4394 5.4889 18.5044C5.55387 18.5694 5.63157 18.6202 5.71712 18.6537C5.80267 18.6872 5.89423 18.7027 5.98604 18.6992C6.07785 18.6956 6.16794 18.6731 6.25065 18.6331C6.33336 18.5931 6.4069 18.5364 6.46667 18.4666L12 12.94L17.5267 18.4666C17.6542 18.5758 17.8183 18.6329 17.986 18.6264C18.1538 18.62 18.313 18.5504 18.4317 18.4317C18.5504 18.3129 18.62 18.1538 18.6265 17.986C18.633 17.8182 18.5759 17.6542 18.4667 17.5266L12.94 12Z" fill="white"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_711_4145">
                            <rect width="24" height="24" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>`;

    class CustomElement {
        /**
         * Represents a custom constructor.
         * @constructor
         * @param {string} type - The type of the constructor.
         * @param {HTMLElement} element - The HTML element associated with the constructor.
         * @param {Object} position - The position of the constructor.
         * @param {string} [elementId=""] - The ID of the element (optional).
         * @param {string} [value=""] - The text associated with the constructor (optional).
         */
        constructor(type, element, position, elementId = "", value = "") {
            this.type = type;
            this.element = element;
            this.position = {
                top: elementId ? position.top : position.top - element.offset().top,
                left: elementId ? position.left : position.left - element.offset().left,
            };
            this.elementId = elementId;
            this.value = value;
        }

        /**
         * Collects user input based on the type of the object.
         */
        collectPops() {
            switch (this.type) {
                case "text":
                    this.value = prompt("Enter text");
                    break;
                case "image":
                    this.value = prompt("Enter image URL");
                    break;

                case "button":
                    this.value = prompt("Enter button text");
                    break;
            }
        }

        /**
         * Creates a custom element based on the specified type.
         */
        createElement() {
            this.elementId = this.elementId || Math.random().toString(36).substring(7);
            switch (this.type) {
                case "text":
                    this.customElement = `
                        <div class="popup-element custom title" data-element="${this.elementId}" style="top:${this.position.top}px; left: ${this.position.left}px">
                            <span>${this.value}</span>
                            <span class="delete">${CLOSE_BUTTON}</span>
                            
                        </div>`;
                    break;
                case "image":
                    this.customElement = `
                        <div class="popup-element custom image" data-element="${this.elementId}" style="top:${this.position.top}px; left: ${this.position.left}px">
                            <img src="${this.value}" />
                            <span class="delete">${CLOSE_BUTTON}</span>
                        </div>
                    `;
                    break;

                case "button":
                    this.customElement = `
                        <div class="popup-element custom button" data-element="${this.elementId}" style="top:${this.position.top}px; left: ${this.position.left}px">
                            <button class="btn btn-dark"><span>${this.value}</span></button>
                            <span class="delete">${CLOSE_BUTTON}</span>
                        </div>
                    `;
                    break;
            }
        }
        // Add draggable listener to the element
        addListeners(element) {
            element.draggable({
                cursor: "move",
                stop: function (event, ui) {
                    // Add element position to temporary storage
                    const element = ui.helper.data("element");
                    elementData[element] = {
                        ...elementData[element],
                        ...ui.position,
                    }
                    // Update the original
                    $(`[data-element='${element}']`).css({
                        top: ui.position.top,
                        left: ui.position.left,
                    }).addClass('dragged');
                },
            });
            // Add delete listener to the element   
            element.find('.delete').on('click', function () {
                const element = $(this).parent().data('element');
                $(`[data-element='${element}']`).remove();
                delete elementData[element];
            })
        }

        constructElement() {
            if (!this.value)
                this.collectPops();
            if (this.value) {
                this.createElement();
                this.element.append(this.customElement);
                this.addListeners($(`[data-element='${this.elementId}']`));
            }
            // Save custom elements to elementData
            elementData[this.elementId] = {
                ...this.position,
                isCustomElement: true,
                elementType: this.type,
                value: this.value,
            }
            return this.customElement;
        }
    }

    /**
     * Restores the position of elements from local storage.
     */
    function restorePositionFromStorage() {
        const elementDetails = JSON.parse(localStorage.getItem(_ELEMENT_DATA));
        const backgroundColor = localStorage.getItem(_POPUP_BACKGROUND);
        if (elementDetails) {
            for (const element in elementDetails) {
                const elementDetail = elementDetails[element];
                $(`[data-element='${element}']`).css({
                    top: elementDetail.top,
                    left: elementDetail.left,
                })
                if (elementDetail.value) $(`[data-element='${element}']`).find('span:not(.delete)').text(elementDetail.value)
                if (elementDetail.value)
                    if (elementDetail.isCustomElement) {
                        const customElement = new CustomElement(
                            elementDetail.elementType,
                            $(".popup-content"),
                            elementDetail,
                            element,
                            elementDetail.value
                        );
                        customElement.constructElement();
                    }
            }
            elementData = elementDetails;

        }
        if (backgroundColor) {
            $('.popup').css('background-color', backgroundColor);
            $('#color-picker').val(backgroundColor);
        }
        $(".editor-content .popup").removeClass("hidden");
    }

    /**
     * Adds a draggable listener to the specified element.
     *
     * @param {jQuery} element - The jQuery element to make draggable.
     */
    function addDraggableListener(element) {
        element.draggable({
            cursor: "move",
            stop: function (event, ui) {
                // Add element position to temporary storage
                const element = ui.helper.data("element");
                elementData[element] = {
                    ...elementData[element],
                    ...ui.position,
                }
                // Update the original
                $(`[data-element='${element}']`).css({
                    top: ui.position.top,
                    left: ui.position.left,
                }).addClass('dragged');
            },
        });
    }

    $("#preview").on("click", function () {
        $("#modal-container").removeAttr("class").addClass("two");
        $("body").addClass("modal-active");
    });

    $("#save").on("click", function () {
        localStorage.setItem(_ELEMENT_DATA, JSON.stringify(elementData));
        localStorage.setItem(_POPUP_BACKGROUND, backgroundColor);
    });

    $("#modal-container").on("click", function (ev) {
        $(this).addClass("out");
        $("body").removeClass("modal-active");
    });

    $(".modal").on("click", function (ev) {
        ev.stopPropagation();
    });


    $("#editor_popup_content").droppable({
        accept: "#editor-elements .editor-element",
        classes: {
            "ui-droppable-active": "editor-highlight",
        },
        drop: function (event, ui) {
            // Identify the element type and prompt appropriate input dialog
            const elementType = ui.helper.data("type");
            /**
             * Represents a custom element.
             * @type {CustomElement}
             */
            const customElement = new CustomElement(
                elementType,
                $(".popup-content"),
                ui.position
            );
            customElement.constructElement();
        },
    });


    var $editorElements = $("#editor-elements");

    $(".editor-element", $editorElements).draggable({
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: (ui, i) => {
            /**
             * Represents the type of element.
             * @type {string}
             */
            const elementType = $(ui.currentTarget).data("type");
            switch (elementType) {
                case "text":
                    return `<div class="popup-element title" data-type="text"><span>Text</span></div>`;
                case "image":
                    return `<div class="popup-element image" data-type="image"><img src="https://placehold.co/400" /></div>`;
                case "button":
                    return `<div class="popup-element button" data-type="button"><button class="btn btn-dark">Button</button></div>`;
            }
        },
        cursor: "move",
    });

    $('#color-picker').on('change', function () {
        const color = $(this).val();
        // Check if the color is valid
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            $('.popup').css('background-color', color);
            backgroundColor = color
        }
    })

    // Add click event to the popup content to enable editing
    $(document).on("click", ".editor .popup-element span:not(.delete)", function () {
        $(this).attr("contenteditable", true).trigger('focus');
        // Move caret to end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(this);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Disable draggable when editing
        const parent = $(this).parent()
        if (parent.hasClass('btn'))
            parent.parent().draggable('disable')
        else
            parent.draggable('disable')
    });

    // Add focusout event to the popup content to disable editing
    $(document).on("focusout", ".editor .popup-element span:not(.delete)", function () {
        $this = $(this)
        $this.attr("contenteditable", false)

        const parent = $(this).parent()
        let element = $this.parent().data('element');
        // Enable draggable when editing is done
        if (parent.hasClass('btn')) {
            parent.parent().draggable('enable')
            element = parent.parent().data('element');
        }
        else
            parent.draggable('enable')

        const value = $this.text();

        elementData[element] = {
            ...elementData[element],
            value
        }
        $(`[data-element='${element}']`).find('span:not(.delete)').text(value)
    });


    restorePositionFromStorage();
    addDraggableListener($(".editor .popup-element"))
});
