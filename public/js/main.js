$('document').ready(function(){
    $('body').on('click','.checkbox',function(){
        var id = $(this).attr('data_id');

        if($(this).attr('class').indexOf('checked') == -1){
            $('#'+id).prop('checked', true).change();
            $(this).addClass('checked');
        }else{                                        
            $('#'+id).prop('checked', false).change();
            $(this).removeClass('checked');
        }
    });
    var checkbox_cnt = 0;
    $('input[type=checkbox]').each(function(){
        $(this).attr('id','checkbox_'+checkbox_cnt).css({'display':'none'});
        var status = $(this)[0].checked ? 'checked':'';
        $(this).before('<div data_id="checkbox_'+checkbox_cnt+'" class="checkbox '+status+'"></div>');

        checkbox_cnt++;
    });
});