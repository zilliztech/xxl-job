$(function(){

	// logout
	$("#logoutBtn").click(function(){
		layer.confirm( I18n.logout_confirm , {
			icon: 3,
			title: I18n.system_tips ,
            btn: [ I18n.system_ok, I18n.system_cancel ]
		}, function(index){
			layer.close(index);

			$.post(base_url + "/logout", function(data, status) {
				if (data.code == "200") {
                    layer.msg( I18n.logout_success );
                    setTimeout(function(){
                        window.location.href = base_url + "/";
                    }, 500);
				} else {
					layer.open({
						title: I18n.system_tips ,
                        btn: [ I18n.system_ok ],
						content: (data.msg || I18n.logout_fail),
						icon: '2'
					});
				}
			});
		});

	});

	// slideToTop
	var slideToTop = $("<div />");
	slideToTop.html('<i class="fa fa-chevron-up"></i>');
	slideToTop.css({
		position: 'fixed',
		bottom: '20px',
		right: '25px',
		width: '40px',
		height: '40px',
		color: '#eee',
		'font-size': '',
		'line-height': '40px',
		'text-align': 'center',
		'background-color': '#222d32',
		cursor: 'pointer',
		'border-radius': '5px',
		'z-index': '99999',
		opacity: '.7',
		'display': 'none'
	});
	slideToTop.on('mouseenter', function () {
		$(this).css('opacity', '1');
	});
	slideToTop.on('mouseout', function () {
		$(this).css('opacity', '.7');
	});
	$('.wrapper').append(slideToTop);
	$(window).scroll(function () {
		if ($(window).scrollTop() >= 150) {
			if (!$(slideToTop).is(':visible')) {
				$(slideToTop).fadeIn(500);
			}
		} else {
			$(slideToTop).fadeOut(500);
		}
	});
	$(slideToTop).click(function () {
		$("html,body").animate({		// firefox ie not support body, chrome support body. but found that new version chrome not support body too.
			scrollTop: 0
		}, 100);
	});

	// left menu status v: js + server + cookie
	$('.sidebar-toggle').click(function(){
		var xxljob_adminlte_settings = $.cookie('xxljob_adminlte_settings');	// on=open，off=close
		if ('off' == xxljob_adminlte_settings) {
            xxljob_adminlte_settings = 'on';
		} else {
            xxljob_adminlte_settings = 'off';
		}
		$.cookie('xxljob_adminlte_settings', xxljob_adminlte_settings, { expires: 7 });	//$.cookie('the_cookie', '', { expires: -1 });
	});

	// left menu status v1: js + cookie
	/*
	 var xxljob_adminlte_settings = $.cookie('xxljob_adminlte_settings');
	 if (xxljob_adminlte_settings == 'off') {
	 	$('body').addClass('sidebar-collapse');
	 }
	 */


    // update pwd
    $('#updatePwd').on('click', function(){
        $('#updatePwdModal').modal({backdrop: false, keyboard: false}).modal('show');
    });
    var updatePwdModalValidate = $("#updatePwdModal .form").validate({
        errorElement : 'span',
        errorClass : 'help-block',
        focusInvalid : true,
        rules : {
            password : {
                required : true ,
                rangelength:[4,50]
            }
        },
        messages : {
            password : {
                required : '请输入密码'  ,
                rangelength : "密码长度限制为4~50"
            }
        },
        highlight : function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        success : function(label) {
            label.closest('.form-group').removeClass('has-error');
            label.remove();
        },
        errorPlacement : function(error, element) {
            element.parent('div').append(error);
        },
        submitHandler : function(form) {
            $.post(base_url + "/user/updatePwd",  $("#updatePwdModal .form").serialize(), function(data, status) {
                if (data.code == 200) {
                    $('#updatePwdModal').modal('hide');

                    layer.msg( I18n.change_pwd_suc_to_logout );
                    setTimeout(function(){
                        $.post(base_url + "/logout", function(data, status) {
                            if (data.code == 200) {
                                window.location.href = base_url + "/";
                            } else {
                                layer.open({
                                    icon: '2',
                                    content: (data.msg|| I18n.logout_fail)
                                });
                            }
                        });
                    }, 500);
                } else {
                    layer.open({
                        icon: '2',
                        content: (data.msg|| I18n.change_pwd + I18n.system_fail )
                    });
                }
            });
        }
    });
    $("#updatePwdModal").on('hide.bs.modal', function () {
        $("#updatePwdModal .form")[0].reset();
        updatePwdModalValidate.resetForm();
        $("#updatePwdModal .form .form-group").removeClass("has-error");
    });
	
});

// 初始化web导出导入事件
function initWebExportImport(){
    // 所需标签
    let allDataCheckTag = $("#allDataCheckTag");
    let dataCheckTag = $('[name=dataCheckTag]:checkbox');
    // 全选全不选
    allDataCheckTag.prop("checked",false);
    allDataCheckTag.click(function() {
        if(this.checked){
            dataCheckTag.prop("checked",true);
        }else{
            dataCheckTag.prop("checked",false);
        }
    })
    //检测是否全选的函数
    dataCheckTag.click(function(){
        let len = dataCheckTag.length;
        let count = 0;
        dataCheckTag.each(function(){
            if($(this).prop("checked")===true){
                count++;
            }
        })
        if(count===len){
            allDataCheckTag.prop("checked",true);
        }else{
            allDataCheckTag.prop("checked",false);
        }
    })
}

// 导出点击
function webExport(){
    let exportArr = [];
    let dataCheckTag = $('[name=dataCheckTag]:checkbox');
    dataCheckTag.each(function(){
        if($(this).prop("checked")===true){
            let row = tableData['key'+$(this).val()];
            // 删除无用字段
            delete row['id'];
            delete row['addTime'];
            delete row['updateTime'];
            delete row['glueUpdatetime'];
            delete row['triggerStatus'];
            delete row['triggerLastTime'];
            delete row['triggerNextTime'];
            delete row['registryList'];
            exportArr.push(row);
        }
    })
    $('#webExportTextArea').val(JSON.stringify(exportArr));
    $('#webExportModal').modal({backdrop: false, keyboard: false}).modal('show');
}
// 导入点击
function webImport(){
    $('#webImportTextArea').val('');
    $('#webImportModal').modal({backdrop: false, keyboard: false}).modal('show');
}
// 执行web导入
function doWebImport(){
    let importJsonStr = $('#webImportTextArea').val();
    let importArr = [];
    try {
        importArr = JSON.parse(importJsonStr);
    } catch (e){
        layer.open({
            title: I18n.system_tips,
            btn: [ I18n.system_ok ],
            content: (I18n.system_unvalid  ),
            icon: '2'
        });
    }
    if(importArr.length<1){
        return;
    }
    importArr.forEach(function (importObj) {
        $.post(base_url + importApiUrl,  $.param(importObj));
    });
    layer.open({
        title: I18n.system_tips ,
        btn: [ I18n.system_ok ],
        content: I18n.system_add_suc ,
        icon: '1',
        end: function(layero, index){
            dataTableObj.fnDraw();
            $('#webImportModal').modal('hide');
        }
    });
}
