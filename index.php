<?php
/**
 * Created by PhpStorm.
 * User: Cherepanov
 * Date: 21.01.2019
 * Time: 19:56
 */

add_action('add_meta_boxes_post', 'x_comics_js_box');
function x_comics_js_box(){
    add_meta_box( 'x_comics_js_box', __('xComics', 'wp'), 'x_comics_js_box_callback', 'post' );
}
// HTML код блока
function x_comics_js_box_callback( $post, $meta ){
    $screens = $meta['args'];
    // Используем nonce для верификации
    wp_nonce_field( plugin_basename(__FILE__), 'x_comics_noncename' );
    // Поля формы для введения данных

    $data_field = get_fields($post->ID, true);



    $arrayJson = [];
    $arrLocalAlias = [
        'ru-RU'=>'Русский',
        'en-US'=>'Английский',
        'de-DE'=>'Немецкий',
    ];
    $arrLocal = [];
    $img_scr = $data_field['картинка']['url'];

    $rows = $data_field['Комикс'];



    $indx = 0;
    $ids = 1;
    foreach ($rows as $row){

        $local = $row['Локаль'];
        array_push($arrLocal, $local);

        if(!is_array($arrayJson[$local])){
            $arrayJson[$local] = array();
        }


        $arrTmp = array();
        $arrTmp['textContent'] = $row['Text'];
        $arrTmp['id'] = $ids;
        $arrTmp['style']['top'] = $row['Top'];
        $arrTmp['style']['left'] = $row['Left'];
        $arrTmp['style']['height'] = $row['Height'];
        $arrTmp['style']['width'] = $row['Widht'];
        $arrTmp['style']['fontFamily'] = $row['Font Family'];
        $arrTmp['style']['transform'] = $row['Transform'];
        $arrTmp['style']['fontWeight'] = $row['Font Weight'];
        $arrTmp['style']['lineHeight'] = $row['Line Hight'];
        $arrTmp['style']['textTransform'] = $row['Text Transform'];
        $arrTmp['style']['textAlign'] = $row['Text Align'];
        $arrTmp['style']['padding'] = $row['Padding'];

        array_push($arrayJson[$local], $arrTmp);

        $indx++;
        $ids++;
    }

    $arrLocal = array_unique($arrLocal);


    $JSONstr = json_encode($arrayJson, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);

    $JSONstr = str_replace('"', "'", $JSONstr);

    $script_addr = get_template_directory_uri() . '/modules/comics/app.js';
    


    echo '<a id="xakpl_btn">Открыть </a>';
    echo '<a id="xakpl_btn2">Собрать</a>';
    echo '<div class="xakpl_result"></div>';

    ob_start(); ?>new xComics('app', '<?php echo $img_scr; ?>', [<?php foreach ($arrLocalAlias as $a=>$v): ?>{name: '<?php echo $v; ?>', local: '<?php echo $a; ?>'},<?php endforeach; ?>], <?php echo $JSONstr; ?> );<?php $output = ob_get_contents();

    ob_end_clean();


    ?>
        <script>
            var xcBtn = document.getElementById('xakpl_btn');
            xcBtn.addEventListener('click', function (e) {
                let style_str = '#xakplImgArea{-moz-user-select:none;-khtml-user-select:none;user-select:none}#xakplImgArea *{-moz-user-select:none;-khtml-user-select:none;user-select:none}.block_resize{background-color:#000;bottom:-20px;cursor:se-resize;height:12px;margin-top:9px;position:absolute;right:-15px;width:12px;border-radius:12px}';

                let w = window.outerWidth;
                let h = window.outerHeight;
                var newWin = window.open("about:blank", "hello", "width="+w+",height="+h);
                newWin.document.write('<style>'+style_str+'</style><div id="app"></div>');
                let s = newWin.document.createElement('script');
                s.src = "<?php echo $script_addr; ?>";
                newWin.document.body.appendChild(s);

                setTimeout(function () {
                    let s2 = newWin.document.createElement('script');
                    let str = <?php echo '"' . quotemeta($output) . '"'; ?>;
                    s2.innerText = str;
                    newWin.document.body.appendChild(s2);
                }, 1000);

                let btn2 = document.getElementById('xakpl_btn2');
                btn2.addEventListener('click', (e)=>{
                    event.preventDefault();
                    let data = newWin.xcomics;
                    let val = new Object();
                    val.width = data.Area.width;
                    val.height = data.Area.height;
                    val.data = data.data;
                    val.id = <?php echo $post->ID; ?>

                    console.log(val);
                    val = JSON.stringify(val);

                    let input = document.querySelector('input#x_comics_json');
                    input.value = val;

                    newWin.close();

                    function fetch(e){var param = $(e.target).attr('data-ajax-param');
                        // Находим id поста по нажатию кнопки. У кнопки должен быть атрибут data-ajax-param равный id поста, например, data-ajax-param="11"
                        $.post('/wp-admin/admin-ajax.php', {'action':'xakpl_save_data', 'data':val}, function(response){
                            $('.xakpl_result').html(response);
                        });
                    }


                    $( '#xakpl_btn2' ).click(function (e) {
                        fetch(e);
                    });

                });





            });
        </script>



    <?php



    echo '<input type="text" id= "x_comics_json" name="x_comics_json" value="'. get_post_meta( $post->ID, '_x_comics_json',true ) .'"/>';
}
