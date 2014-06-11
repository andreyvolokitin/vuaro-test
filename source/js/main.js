/*====самописные плагины====*/

/*
Плагин исполняет запрос к серверу.
Когда запрос сделан успешно - добавляет html, сгенерированный из указанного шаблона.
Если опции для шаблона не указаны, плагин добавляет содержимое опции 'manualHtml' -
там может быть любая строка, в том числе и html.
Добавление html по умолчанию происходит в начало элемента.
Если указан индекс дочернего элемента, после которого надо добавить html,
то плагин добавляет html после этого элемента или в самый конец,
если дочернего элемента с указанным индексом не существует.
После успешного добавления элемента плагин вызывает опциональный коллбэк.
*/
(function($){
    $.fn.addItem = function( options ) {
        options = $.extend( {}, $.fn.addItem.options, options );

        var $that = this;

        if ($that.hasClass('processing')) {
            return $that;
        }

        var children = $that.children(),
            html = $.isEmptyObject(options.tplOpts) ?
                options.manualHtml :
                tmpl(options.tplOpts.tplId, options.tplOpts.tplData),
            index = options.insertAfter;

        $that.addClass('processing');


        $.when(options.request())
            .then(function() {
                /*success*/
                if (index < 0) {
                    $that.prepend(html);
                } else {
                    if (children.eq(index).length) {
                        $(html).insertAfter(children.eq(index));
                    } else {
                        $that.append(html);
                    }
                }

                options.onSuccess();
            }, function(){
                /*fail*/

                options.onFail();
            })
            .always( function() {
                $that.removeClass('processing');
            });

        return $that;
    };

    $.fn.addItem.options = {
        request: function() {},/*серверный запрос*/
        onSuccess: function() {},/*в случае успешного запроса*/
        onFail: function() {},/*в случае неудачного запроса*/
        manualHtml: '',/*строка для добавления*/
        tplOpts: {},/*опции для генерации шаблона - id шаблона и данные в формате JSON*/
        insertAfter: -1/*индекс дочернего элемента, после которого происходит добавление*/
    };
})(jQuery);

/*
Плагин исполняет запрос к серверу. Когда запрос сделан успешно - удаляет элемент.
Плагин следит за сестринскими элементами. Если среди них не остаётся элементов с указанным классом,
то плагин изменяет состояние указанного блока-предка (путём добавления указанного в опциях класса,
либо дефолтного) или родительского блока, если блок-предок не указан.
Если не указывается класс удаляемых сестринских элементов, то плагин подразумевает любые сестринские элементы.
После успешного удаления элемента плагин вызывает опциональный коллбэк.
*/
(function($){
    $.fn.removeItem = function( options ) {
        options = $.extend( {}, $.fn.removeItem.options, options );

        var $that = this;

        if ($that.hasClass('processing')) {
            return $that;
        }

        var $siblings = $that.siblings(options.siblings).length ? $that.siblings(options.siblings) : $that.siblings(),
            $ancestor = $that.closest(options.ancestor).length ? options.ancestor : $that.parent(),
            emptyClass = options.emptyClass || 'container_state_empty';

        $that.addClass('processing');

        $.when(options.request())
            .then(function() {
                /*success*/
                $that.remove();
                if (!$siblings.length) {
                    $ancestor.addClass(emptyClass);
                }

                options.onSuccess();
            }, function(){
                /*fail*/

                options.onFail();
            })
            .always( function() {
                $that.removeClass('processing');
            });

        return $that;
    };

    $.fn.removeItem.options = {
        request: function() {},/*серверный запрос*/
        onSuccess: function() {},/*в случае успешного запроса*/
        onFail: function() {},/*в случае неудачного запроса*/
        ancestor: null,/*предок удаляемого элемента, состояние которого будет изменяться в случае удаления всех элементов*/
        siblings: '',/*элементы, считающиеся за удаляемые; блок 'ancestor' изменяет состояние при удалении всех таких элементов*/
        emptyClass: ''/*класс, который будет добавлен блоку 'ancestor' в случае удаления всех элементов в нём*/
    };
})(jQuery);

/*функция фильтрации ввода в инпут: только числа или клавиши с кодами  - 0, 8, 13, 9, 37*/
function filterNumbers(event) {
    var key,
        keyChar;

    if(!event) {
        var event = window.event;
    }
    if (event.keyCode) {
        key = event.keyCode;
    } else if(event.which) {
        key = event.which;
    }
    if(key == null || key == 0 || key == 8 || key == 13 || key == 9 || key == 37 ) {
        return true;
    }
    keyChar=String.fromCharCode(key);
    if(!/[0-9]{1,10}/.test(keyChar)) {
        return false;
    } else {
        return true;
    }
}
/*функция пересчёта тотала корзины*/
function recalculateBasket(basket){
    var sum = 0;
    basket.find('.basket__product').each(function(){
        sum += parseInt($(this).find('.basket__product-sum').text());
    });
    basket.find('.basket__total').text(sum);
}
/*функция пересчёта стоимости продукта с учётом его количества*/
function recalculateBasketProduct(basket, product){
    var price = parseInt(product.find('.basket__product-price').text()),
        count = parseInt(product.find('.basket__product-count').val());
    product.find('.basket__product-sum').text(price * count);
    recalculateBasket(basket);
}
/*функция добавления данных в localStorage*/
function addToStorage(storageLabel, data, key){
    var storageItem = JSON.parse(window.localStorage.getItem(storageLabel)),
        currentData = storageItem || {};

    currentData[key] = data;
    window.localStorage.setItem(storageLabel, JSON.stringify(currentData));
}
/*функция удаления данных из localStorage*/
function removeFromStorage(storageLabel, key){
    var currentData = JSON.parse(window.localStorage.getItem(storageLabel));
    if (currentData) {
        delete currentData[key];
        window.localStorage.setItem(storageLabel, JSON.stringify(currentData));
    }
}
/*генерация уникальной метки*/
function getUniqueTimestamp() {
    var time = new Date().getTime();
    while (time == new Date().getTime());
    return new Date().getTime();
}



/*====Код приложения====*/

/*дефолтное состояние корзины - массив описаний продуктов в JSON*/
var defaultBasketState = [
        {
            "id": getUniqueTimestamp(),
            "pic": "img/pp0.jpg",
            "name": "Лопата совковая совковая совковая совковая совковая совковая совковая совковая совковая совковая совковая совковая совковая совковая",
            "price": 402,
            "quantity": 2
        },
        {
            "id": getUniqueTimestamp(),
            "pic": "img/pp1.jpg",
            "name": "Лопата штыковая",
            "price": 1009,
            "quantity": 1
        }
    ],
    /*метка, по которой в localStorage которой хранятся данные для корзины*/
    basketStorageLabel = 'myBasket';

/*добавляем дефолтное состояние корзины в localStorage, если это первая загрузка приложения*/
if (!window.localStorage.getItem(basketStorageLabel)) {
    for (var i = 0; i < defaultBasketState.length; i++) {
        addToStorage(basketStorageLabel, defaultBasketState[i], 'product:' + defaultBasketState[i].id);
    }
}

/*on document ready*/
$(function(){
    /*клик на обёртке инпута переносит фокус на инпут*/
    $(document)
        .on('click', '.input', function(e){
            e.stopPropagation();
            $(this).find('.input__field').trigger('focus');
        });

    /*фокус на инпуте меняет состояние его обёртки*/
    ;(function(){
        var focusClass = 'input_state_focus';

        $(document)
            .on('click', '.input__field', function(e){
                e.stopPropagation();
            })
            .on('focus', '.input__field', function(){
                $(this).closest('.input').addClass(focusClass);
            })
            .on('focusout', '.input__field', function(){
                $(this).closest('.input').removeClass(focusClass);
            });
    }());

    /*инпуты только с числовым вводом*/
    $(document)
        .on('keypress', '.num-input', filterNumbers)

        /*фокус на числовых инпутах выделяет содержимое*/
        .on('focus click', '.num-input', function(){
            var $that = $(this);

            setTimeout(function(){
                $that.select();
            }, 0);
        });

    /*убрать фокус с кликнутой кнопки*/
    $(document)
        .on('click', '.button', function(){
            $(this).blur();
        })
        .on('mouseup', function(){
            $('.button:focus').blur();
        })
        /*button mousedown fix*/
        .on("mousedown mouseup", '.button', function(e){
            $(this).toggleClass( "active", e.type === "mousedown" );
        }).on("mouseleave", '.button', function(e){
            $(this).removeClass( "active");
        });



    /*local scope*/
    ;(function(){
        var $basketWrap = $('.basket-wrap'),
            $basketOuter= $basketWrap.parent(),
            basketEmptyClass = 'basket_state_empty',
            basketSubmittedClass = 'basket_state_submitted',
            $basketBlock = null,
            basketData = JSON.parse(window.localStorage.getItem(basketStorageLabel)) || {},
            property,
            productData,
            html = '';

        /*генерируем html корзины в соответствии с состоянием в localStorage и вставляем на страницу*/
        for (property in basketData) {
            if (basketData.hasOwnProperty(property)) {
                productData = basketData[property];
                html += tmpl('basket_item_tmpl', productData);
            }
        }

        $basketWrap
            .append(tmpl('basket_tmpl', {
                "items": html
            }))
            .find('.basket__product')
            .each(function(){
                var $product = $(this),
                    $basket = $product.closest('.basket');

                recalculateBasketProduct($basket, $product);
            });

        $basketBlock = $basketWrap.find('.basket');

        if ($.isEmptyObject(basketData)) {
            $basketBlock.addClass(basketEmptyClass);
        }

        $basketOuter.removeClass('loading');


        /*добавление элементов в корзину*/
        $(document).on('submit', '.basket__add-unique-product', function(e){
            var $that = $(this),
                $basket = $that.closest('.basket'),
                $currentProducts = $basket.find('.basket__product'),
                $basketContainer = $basket.find('.basket__src'),
                uniqueId = getUniqueTimestamp(),
                productJSON = {
                    "id": uniqueId,
                    "pic": "http://placebacn.com/70/70",
                    "name": "Бекон, сорт №" + Math.ceil((Math.random()*20)),
                    "price": Math.ceil((Math.random()*1500)),
                    "quantity": 1
                };

            e.preventDefault();

            $basketContainer.addItem({
                request: function() {
                    /*серверный запрос*/
                },
                onSuccess: function() {
                    /*специфичные действия в случае успешного выполнения запроса*/

                    if ($basketBlock.hasClass(basketEmptyClass)) {
                        $basketBlock.removeClass(basketEmptyClass);
                    }
                    if ($basketBlock.hasClass(basketSubmittedClass)) {
                        $basketBlock.removeClass(basketSubmittedClass);
                    }
                    addToStorage(basketStorageLabel, productJSON, 'product:' + uniqueId);
                    recalculateBasketProduct($basket, $basket.find('.basket__product-id[value="' + uniqueId + '"]').closest('.basket__product'));
                },
                onFail: function() {
                    /*специфичные действия в случае неудачного выполнения запроса*/
                },
                tplOpts: {
                    tplId: 'basket_item_tmpl',
                    tplData: productJSON
                },
                insertAfter: $currentProducts.length - 1
            });

        });

        /*удаление элементов из корзины*/
        $(document).on('click', '.basket__product-delete', function(e){
            var $control = $(this),
                productClass = 'basket__product',
                $product = $control.closest('.' + productClass),
                $basket = $product.closest('.basket');

            $product.removeItem({
                request: function() {
                    /*серверный запрос*/
                },
                onSuccess: function() {
                    /*специфичные действия в случае успешного выполнения запроса*/
                    removeFromStorage(basketStorageLabel, 'product:' + $product.find('.basket__product-id').val());
                    if ($basket.find('.' + productClass).length) {
                        recalculateBasket($basket);
                    }
                },
                onFail: function() {
                    /*специфичные действия в случае неудачного выполнения запроса*/
                },
                ancestor: $basketBlock,
                siblings: '.basket__product',
                emptyClass: basketEmptyClass
            });

        });

        /*пересчёт корзины и сохранение данных после смены количества товара по 'keyup', но с дебаунсом 350мс. и только если значение сменилось*/
        $(document).on('keyup', '.basket__product-count', $.debounce(350, function(e){
            var $input = $(this),
                minVal = '1',
                wasEmpty = !$input.val().length,
                wasZero = parseInt($input.val()) === 0,
                currentVal = wasEmpty || wasZero ? minVal : parseInt($input.val(), 10),
                prevVal = $input.data('prev-val') ? $input.data('prev-val') : $input[0].defaultValue,
                $product = null,
                $basket = null,
                productKey = -1,
                productData = null;

            if (wasEmpty || wasZero) {
                $input.val(minVal);
                $input.data('prev-val', minVal);
            } else {
                $input.data('prev-val', currentVal);
            }

            if (currentVal === prevVal) {
                return;
            }

            $product = $input.closest('.basket__product');
            $basket = $product.closest('.basket');
            productKey = 'product:' + $product.find('.basket__product-id').val();
            productData = JSON.parse(window.localStorage.getItem(basketStorageLabel))[productKey];
            productData.quantity = currentVal;
            $input.val(currentVal);

            $.when(function(){
                    /*request*/

                }())
                .then(function() {
                    /*success*/
                    addToStorage(basketStorageLabel, productData, productKey);
                    recalculateBasketProduct($basket, $product);
                }, function(){
                    /*fail*/
                });

        }));

        /*сабмит корзины*/
        $(document).on('submit', '.basket__form', function(e){
            var $form = $(this),
                $basket = $form.closest('.basket'),
                serialized = $form.serialize();

            e.preventDefault();

            alert('Сериализованные данные формы: ' + serialized + '. Подтвердите для продолжения.');

            $.when(function(){
                    /*request*/

                }())
                .then(function() {
                    /*success*/
                    var property,
                        basketData = JSON.parse(window.localStorage.getItem(basketStorageLabel));

                    /*удалить все товары из корзины и localStorage*/
                    $basket.find('.basket__product').remove();

                    for (property in basketData) {
                        if (basketData.hasOwnProperty(property)) {
                            removeFromStorage(basketStorageLabel, property);
                        }
                    }

                    $basket.addClass(basketSubmittedClass);

                }, function(){
                    /*fail*/

                });

        });
    }());









});
