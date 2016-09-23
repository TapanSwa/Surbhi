/* **************************************************************************************  
 ** Copyright (c) 1998-2014 Softype, Inc.                                 
 ** Morvi House, 30 Goa Street, Ballard Estate, Mumbai 400 001, India
 ** All Rights Reserved.                                                    
 **                                                                         
 ** This software is the confidential and proprietary information of          
 ** Softype, Inc. ("Confidential Information"). You shall not               
 ** disclose such Confidential Information and shall use it only in          
 ** accordance with the terms of the license agreement you entered into    
 ** with Softype.                       
 ** @author:  Sarah Akid
 ** @version: 1.0
 ** Description: Client Side Script for Course Scheduling
 ************************************************************************************** */

/**GLOBAL VAR**/
var selectedCourseId;
var genericOptTimes;
var optionsFaculties;
var z=100;
var arrDays , arrTimes, arrGrpDays;
var method='scratch';
var goingBack=false;
var colorBg;
var dots=0;
/**LIST OF CLASSROOMS**/
var optionsRooms, optionsRmTypes;
var id_nameSections_preview=new Array();

//Reset vars
var prevTrm, prevYr, prevCrse, prevCrseId, prevTrmH, prevYrH;    
var numClassesPerWeek;
var initialRows;

/**STEP3:CHOICE OF DAYS IN THE POPUP OF TIMINGS**/
$(document).on('click', '[name="choiceday"]', function () {
	var choiceSelected = $(this).val(); 
	if(choiceSelected=='grouped')
	{
		numClassesPerWeek=$('#coursSchedTime tbody tr').length;

		initialRows=$("#coursSchedTime tbody").html();
		if(numClassesPerWeek==2)
		{
			$("#coursSchedTime").find("tr:gt(1)").remove();
			var optDayGrp='<option></option>';
			for(var gp=0; gp<arrGrpDays.length; gp++)
				if(arrGrpDays[gp].split(':')[2].split(',').length==2)
					optDayGrp+='<option value="'+arrGrpDays[gp].split(':')[2]+'">'+arrGrpDays[gp].split(':')[1]+'</option>';

			$("#listDays0").empty().append(optDayGrp);

		}
		else if(numClassesPerWeek==3)
		{
			$("#coursSchedTime").find("tr:gt(1)").remove();
			var optDayGrp='<option></option>';
			for(var gp=0; gp<arrGrpDays.length; gp++)
				if(arrGrpDays[gp].split(':')[2].split(',').length==3)
					optDayGrp+='<option value="'+arrGrpDays[gp].split(':')[2]+'">'+arrGrpDays[gp].split(':')[1]+'</option>';

			$("#listDays0").empty().append(optDayGrp);
		}
		else if(numClassesPerWeek>3)
		{
			$("#coursSchedTime").find("tr:gt(1)").remove();
			var optDayGrp='<option></option>';
			for(var gp=0; gp<arrGrpDays.length; gp++)
				optDayGrp+='<option value="'+arrGrpDays[gp].split(':')[2]+'">'+arrGrpDays[gp].split(':')[1]+'</option>';

			$("#listDays0").empty().append(optDayGrp);
			$('#listDays0').change(function() { if( !isEmpty($(this).val())) grpDaysFunction(0); });
		}
	}
	else if(choiceSelected=='indiv')
	{
		$("#coursSchedTime tbody").empty().append(initialRows);
	}
	if($("#SuccessMsg").length!=0)
	{
		$("#SuccessMsg").remove();
	}
});

/**STEP4:HANDLES ANIMATED DOTS**/
var dots = 0;
function type() 
{
	if(dots < 3) {
		$('#dots').append('.');
		dots++;
	} else {
		$('#dots').html('');
		dots = 0;
	}
}

/**STEP4:DISPLAY GROUP DAYS TABLE ON POPUP OF TIMINGS**/
function grpDaysFunction(num)
{
	var numColumns=$("table[id^='course']").eq(0).find("thead > tr:eq(0) > td").length;
	var totNumb=$('select[id^="listDays"]').length;
	var slidesWidth=420;
	var pos=parseInt(Math.abs($('#slidesHolder').css('margin-left').replace('px', '')))/slidesWidth;
	var obj=$('.slide:eq('+pos+')').find('table[id^="course"]').find('input[type=checkbox]:checked');
	var classes;
	if(numColumns==3 || numColumns==5)
		classes=parseInt(obj.eq(0).closest('tr').find('td:eq(1)').text());
	else
		classes=parseInt(obj.eq(0).closest('tr').find('td:eq(2)').text());
	var days=0;
	$('select[id^="listDays"]').each(function(){
		days+=$(this).val().split(',').length;
		if(days>classes)
		{
			messagePopup('Number of classes exceeded.');
			$(this).val('');
			return false;
		}

	});
	if(days<(classes-1) && num==(totNumb-1))
	{
		var html='<tr><td><select id="listDays'+totNumb+'">';
		html+=$('#listDays0').html();
		html+='</select></td>';
		html+='<td><select id="listStartTime'+totNumb+'" onchange="checkTime(this,\'1\')">'+$('#listStartTime0').html()+'</select></td>';
		html+='<td><select id="listEndTime'+totNumb+'" onchange="checkTime(this,\'1\')" disabled>'+$('#listEndTime0').html()+'</select></td></tr>';

		$('#coursSchedTime').append(html);
		$('#listDays'+totNumb).change(function() { if( !isEmpty($(this).val())) grpDaysFunction(totNumb); });
	}

}

/**DOCUMENT READY**/
$(document).ready(function(){
	//Always remove params from url	
	if(nlapiGetFieldValue('custpage_facclass_url')!=null)
	{
		nlapiSetFieldValue('custpage_facclass_url', window.location.href);
	}


	var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
	history.replaceState("object or string", "title",URL+'&compid='+nlapiGetContext().getCompany());

	/**AJAX CALL TO FILL COURSES LIST IN COURSES FIELDS**/
	if($("#autocomplete")!=undefined && $("#autocomplete").length!=0)
	{
		var temp_sc =$("#autocomplete").val();
		$("#autocomplete").val(temp_sc);
	}
	if($("#autocompleteH")!=undefined && $("#autocompleteH").length!=0)
	{
		var temp_hs=$("#autocompleteH").val();
		$("#autocompleteH").val(temp_hs);
	}

	if($("input[type='radio'][name='method']:checked").val()=='historical')
		method='historical';

	if($("#listTerms")!=undefined && $("#listTerms").length!=0)
	{
		prevTrm=$("#listTerms").val();
		prevTrmH=$("#listTermsH").val();
		prevYrH=$('#listAcadYrH').val();
		if(method=='scratch')
			getCourses($("#listTerms").val());
		else
			getCourses($("#listTermsP").val());
		$("#autocompleteH").val(temp_hs);
		$("#autocomplete").val(temp_sc);
	}

	if(method=='scratch')
	{
		if(isEmpty($('#listAcadYr').val()))
		{
			if($('#listTerms option[id="defaultTerm"]').index()==1)
				$('#listAcadYr')[0].selectedIndex = $('#listAcadYr option[id="currentYear"]').index() +1;
			else
			{
				$('#listAcadYr option[id="currentYear"]').attr('selected','selected');
				$("#listTerms").find('option').each(function(){
					if($("#defaultTerm").index()==1)
					{
						if($(this).index() != ($('#listTerms option').length-1))
							$(this).attr('disabled','disabled');
					}
					else
					{
						if($(this).index() < ($("#defaultTerm").index()-1) && $(this).val()!='')
							$(this).attr('disabled','disabled');
					}
				});
			}
		}


	}
	else
	{
		if(isEmpty($('#listAcadYrP').val()))
		{
			if($('#listTermsP option[id="defaultTerm"]').index()==1)
				$('#listAcadYrP')[0].selectedIndex = $('#listAcadYrP option[id="currentYear"]').index() + 1;
			else
			{
				$('#listAcadYrP option[id="currentYear"]').attr('selected','selected');
				$("#listTermsP").find('option').each(function(){
					if($("#defaultTerm").index()==1)
					{
						if($(this).index() != ($('#listTermsP option').length-1))
							$(this).attr('disabled','disabled');
					}
					else
					{

						if($(this).index() < ($("#defaultTerm").index()-1) && $(this).val()!='')
							$(this).attr('disabled','disabled');
					}
				});
			}
		}   
	}


	/**ADJUST COLOR DYNAMICALLY**/
	colorBg=''+rgbToHex($('#ns_navigation').css('backgroundColor'));
	$('.FldGrpHdr').css('color', colorBg);
	$('caption').css('background-color', colorBg);


	/**IN TIMINGS: GET LIST OF PROGRAMS WHEN TERM AND COURSE SELECTED --FROM SCRATCH--**/
	$('#listTerms').on('focus', function () {
		$(this).data('previous', $(this).val());
	}).on('change',function(){
		prevTrm=$(this).data('previous');
		$('#autocomplete').val('');
		if(!isEmpty($("#listTerms").val()))
		{
			getCourses($("#listTerms").val());
		}
		else 
			getCourses();
		$(this).data('previous', $(this).val());
		$('#listPrograms').val('');
		$('#descFld').text('');
		if($("#SuccessMsg").length!=0)
		{
			$("#SuccessMsg").remove();
		}
	});
	$('#autocomplete').on('focus', function () {
		prevCrse=$(this).val();
		if(isEmpty(prevCrse))
			prevCrseId='';
		else
			prevCrseId=selectedCourseId;
	});
	$('#autocompleteH').on('focus', function () {
		prevCrse=$(this).val();
		if(isEmpty(prevCrse))
			prevCrseId='';
		else
			prevCrseId=selectedCourseId;
	});
	/**IN TIMINGS: GET LIST OF PROGRAMS WHEN TERM AND COURSE SELECTED --FROM HISTORICAL--**/
	$('#listTermsP').on('focus', function () {
		$(this).data('previous', $(this).val());
	}).on('change',function(){
		prevTrm=$(this).data('previous');
		if(!isEmpty($("#listTermsP").val()))
		{
			$('#autocompleteH').val('');
			getCourses($("#listTermsP").val());
		}
		else 
			getCourses();
		$(this).data('previous', $(this).val());
		$('#listProgramsH').val('');
		$('#descFldH').text('');
		if($("#SuccessMsg").length!=0)
		{
			$("#SuccessMsg").remove();
		}
	});
	$('#listTermsH').on('focus', function () {
		$(this).data('previous', $(this).val());
	}).on('change',function(){
		prevTrmH=$(this).data('previous');
		$(this).data('previous', $(this).val());
		if($("#SuccessMsg").length!=0)
		{
			$("#SuccessMsg").remove();
		}
	});

	/**IN TIMINGS: EVENT ON THE ROWS OF SECTION TABLES TO DISPLAY RESPECTIVE SECTION ON THE CALENDAR**/
	$('body').on({
		mouseenter: function(){
			var idSection=$(this).find('> td:eq(0)').attr('id');
			$(this).css("background","#fafafa");

			if($('[id^="canvas_'+idSection+'_"]').length!=0)
			{
				canvas=$('[id^="canvas_'+idSection+'_"]');
				$.data(this, 'zindex', canvas.css('z-index'));  
				$.data(this, 'id', idSection); 
				for(var c=0; c<$('[id^="canvas_'+idSection+'_"]').length; c++)
					$.data(this, 'shadow'+c, canvas.eq(c).css('box-shadow')); 
				canvas.css('z-index',z++);
				canvas.css('box-shadow',"0px 0px 2px 2px #607799");
			}	
		},
		mouseleave: function(){
			$(this).css("background","");
			if($('[id^="canvas_'+$.data(this, 'id')+'_"]').length!=0)
			{
				$(this).css("background","#fefeee");
				$('[id^="canvas_'+$.data(this, 'id')+'_"]').css('z-index',$.data(this, 'zindex'));
				for(var c=0; c<$('[id^="canvas_'+$.data(this, 'id')+'_"]').length; c++)
					$('[id^="canvas_'+$.data(this, 'id')+'_"]').eq(c).css('box-shadow',$.data(this, 'shadow'+c));
			}
		}
	}, 'table[id^="course"] > tbody >tr');

	/**IN TIMINGS: CHANGE OF DISPLAY UPON CHOOSING THE SCHEDULING METHOD**/
	$('input[type=radio][name=method]').change(function() {
		if (this.value == 'historical') {
			$('#CrsSchedFields').hide();
			$('#CrsSchedFieldsHist').show();
			defaultAcadYearH();
			method='historical';

			if($('#listTermsP option[id="defaultTerm"]').index()==1)
				$('#listAcadYrP')[0].selectedIndex = $('#listAcadYrP option[id="currentYear"]').index() + 1;
			else
			{
				$('#listAcadYrP option[id="currentYear"]').attr('selected','selected');
				$("#listTermsP").find('option').each(function(){
					if($("#defaultTerm").index()==1)
					{
						if($(this).index() != ($('#listTermsP option').length-1))
							$(this).attr('disabled','disabled');
					}
					else
					{

						if($(this).index() < ($("#defaultTerm").index()-1) && $(this).val()!='')
							$(this).attr('disabled','disabled');
					}
				});

			}


			hideSchedule();
		}
		else if (this.value == 'scratch') {
			$('#CrsSchedFields').show();
			$('#CrsSchedFieldsHist').hide();
			method='scratch';
			hideSchedule();
		}
		$('.btnAP:eq(3)').hide();
		$(':button').attr('disabled',false);
		$('.btnAP:eq(0)').attr('disabled',true);
		$('.btnAP:eq(1)').attr('disabled',true);
		$('select').attr('disabled',false);
		$(':text').attr('disabled',false);
	});

	/**IN TIMINGS: DETECT IF THE USER IS GOING BACK FROM ANOTHER STEP AHEAD AND DISPLAY THE CALENDAR WITHOUT CLICKING ON SCHEDULE BUTTON**/
	if(!isEmpty($('#listAcadYr').val()) && !isEmpty($('#autocomplete').val()))
	{
		if(!isEmpty(selectedCourseId))
		{
			callCommonAjax('&action=getDescription&item='+selectedCourseId,function(desc){
				if(desc)
				{
					$('#descFld').text(desc);
					getPrograms(selectedCourseId);
					schedule(false);
				}

			});
		}
	}
	if(!isEmpty($('#listTermsP').val()) && !isEmpty($('#listTermsH').val()) && !isEmpty($('#listAcadYrP').val()) && !isEmpty($('#autocompleteH').val()))
	{
		goingBack=true;
		method='historical';
		if(!isEmpty(selectedCourseId))
		{
			callCommonAjax('&action=getDescription&item='+selectedCourseId,function(desc){
				if(desc)
				{
					$('#descFldH').text(desc);
					getPrograms(selectedCourseId);
					schedule(false);
				}

			});
		}


	}
	$('#listAcadYr').on('focus', function () {
		$(this).data('previous', $(this).val());
	}).on('change',function(){
		prevYr=$(this).data('previous');
		if($("#listAcadYr").val()==$("#currentYear").val())
		{
			$("#listTerms").find('option').each(function(){
				if($("#defaultTerm").index()==1)
				{
					if($(this).index() != ($('#listTerms option').length-1))
						$(this).attr('disabled','disabled');
				}
				else
				{
					if($(this).index() < ($("#defaultTerm").index()-1) && $(this).val()!='')
						$(this).attr('disabled','disabled');
				}
			});
			$("#listTerms").val('');
		}
		else
		{
			$("#listTerms").find('option').each(function(){
				$(this).removeAttr('disabled');
			});
		}
		if(!isEmpty($('#listTerms').val()) && !isEmpty($('#autocomplete').val()) && !isEmpty($('#listAcadYr').val()))
		{
			getPrograms(selectedCourseId);
		}
		$(this).data('previous', $(this).val());
		if($("#SuccessMsg").length!=0)
		{
			$("#SuccessMsg").remove();
		}
	});
	$('#listAcadYrP').on('focus', function () {
		$(this).data('previous', $(this).val());
	}).on('change',function(){
		prevYr=$(this).data('previous');
		if($("#listAcadYrP").val()==$("#currentYear").val())
		{
			$("#listTermsP").find('option').each(function(){
				if($("#defaultTerm").index()==1)
				{
					if($(this).index() != ($('#listTermsP option').length-1))
						$(this).attr('disabled','disabled');
				}
				else
				{

					if($(this).index() < ($("#defaultTerm").index()-1) && $(this).val()!='')
						$(this).attr('disabled','disabled');
				}
			});
			$("#listTermsP").val('');
		}
		else
		{
			$("#listTermsP").find('option').each(function(){
				$(this).removeAttr('disabled');
			});
		}
		if(!isEmpty($('#listTermsP').val()) && !isEmpty($('#autocompleteH').val()) && !isEmpty($('#listAcadYrP').val()))
		{
			getPrograms(selectedCourseId);
		}
		$(this).data('previous', $(this).val());
		if($("#SuccessMsg").length!=0)
		{
			$("#SuccessMsg").remove();
		}
	});

	$('#listAcadYrH').on('focus', function () {
		$(this).data('previous', $(this).val());
	}).on('change',function(){
		prevYrH=$(this).data('previous');
		if($("#currentYear").length!=0  && !isEmpty($("#listAcadYrH").val()) )
		{
			if($("#listAcadYrH").val()==$("#currentYear").val())
			{
				$("#listTermsH").find('option').each(function(){
					if($("#defaultTerm").index()>1)
					{
						if($(this).index() >= $("#defaultTerm").index())
							$(this).attr('disabled','disabled');
					}

				});
				$("#listTermsH").val('');
			}
			else
			{
				$("#listTermsH").find('option').each(function(){
					$(this).removeAttr('disabled');
				});
			}

		} 
		$(this).data('previous', $(this).val());
		if($("#SuccessMsg").length!=0)
		{
			$("#SuccessMsg").remove();
		}
	});






	/**IN FACULTIES: DETECT IF THE USER IS ON FACULTY ASSIGNMENT STEP**/
	if($('#facultyStep').length!=0)
	{
		//SAVE LIST OF CLASSROOMS SHOWN ON PAGE LOAD
		var selectedFac=$('select[id^="listFac_"]')[0].selectedIndex;
		$('select[id^="listFac_"]').eq(0).find('option:selected').removeAttr("selected");
		optionsFaculties=$('select[id^="listFac_"]').eq(0).html();
		$('select[id^="listFac_"]')[0].selectedIndex=selectedFac;

		var selectedRoom=$('select[id^="listRm_"]')[0].selectedIndex;
		$('select[id^="listRm_"]').eq(0).find('option:selected').removeAttr("selected");
		optionsRooms=$('select[id^="listRm_"]').eq(0).html();
		$('select[id^="listRm_"]')[0].selectedIndex=selectedRoom;

		var selectedRmType=$('select[id^="listRmType_"]')[0].selectedIndex;
		$('select[id^="listRmType_"]').eq(0).find('option:selected').removeAttr("selected");
		optionsRmTypes=$('select[id^="listRmType_"]').eq(0).html();
		$('select[id^="listRmType_"]')[0].selectedIndex=selectedRmType;

		manageSlidesFacClass();
	}

	/**IN PREVIEW: GET DATA SENT TO PREVIEW THE FINAL CALENDAR BEFORE SUBMISSION**/
	if(nlapiGetFieldValue('custpage_canvas_array')!=null)
	{
		var res=nlapiGetFieldValue('custpage_canvas_array').toString();
		var arrToAddCalendar=res.split(']');
		var temp=[];
		var current_idSec=arrToAddCalendar[0].split(';')[1];
		var current_sec=arrToAddCalendar[0].split(';')[0];
		for(var arr=0; arr<arrToAddCalendar.length; arr++)
		{
			var line=arrToAddCalendar[arr].split(';');
			if(current_idSec!=line[1])
			{
				id_nameSections_preview.push([current_idSec,current_sec.split('/')[0],current_sec.split('/')[1],current_sec.split('/')[2]]);
				addToCalendar(current_sec,current_idSec,temp);
				temp=[];
				current_idSec=line[1];
				current_sec=line[0];
			}
			temp.push([line[2],line[3],line[4]]);

		}
	}

	/**IN PREVIEW: FILTER CALENDAR BY SECTION**/
	$("#dispBySec").change(function() {
		var val=$(this).val();
		if(val!='--Show All--')
		{
			$('canvas').show();
			$('canvas:not([id^="canvas_'+val+'_"])').hide();
			$('[id^="canvas_'+val+'_"]').css('z-index',z++);
		}
		else
			$('canvas').show();	
	});

});

/*----FUNCTION TO MANAGE SLIDING TABS----*/
function manageNav(position,numberOfSlides) {
	//hide left arrow if position is first slide
	if(position==0)
	{ 
		$('#leftNav').css("visibility", "hidden");
	}
	else { 
		$('#leftNav').css("visibility", "visible");
	}

	//hide right arrow is slide position is last slide
	if(position==numberOfSlides-1)
	{ 
		$('#rightNav').css("visibility", "hidden");
	}
	else
	{ 
		$('#rightNav').css("visibility", "visible");
	}
	return;
}

/*----FUNCTION TO MANAGE SLIDING TABS----*/
function moveSlide(slideWidth,currentPosition) {
	$('#slidesHolder')
	.animate({'marginLeft' : slideWidth*(-currentPosition)});

	return;
}

/**STEP4: DISPLAYS TABLE OF FACUTLY AND CLASSROOM**/
function manageSlidesFacClass()
{
	$('#slideshow').show("fast",function(){
		$(":button").css("visibility", "visible");
		$(":button").prop("disabled", false);
		var currentPosition = 0;
		var slideWidth = 1100;
		var slides = $('.slide');
		var numberOfSlides = slides.length;
		var arrowsMargin=90-Math.ceil((100*slideWidth)/$( window ).width());
		arrowsMargin=arrowsMargin/2;
		slides.wrapAll('<div id="slidesHolder"></div>');
		slides.css({ 'float' : 'left' });


		//set #slidesHolder width equal to the total width of all the slides
		$('#slidesHolder').css('width', slideWidth * numberOfSlides);
		$('#slidesHolder').css('margin-left','auto');
		$('#slidesHolder').css('margin-right','auto');
		$('#slideshow').prepend('<img style="padding-right:inherit;margin-left:'+arrowsMargin+'%;" class="nav" id="leftNav" src="'+$("#custpage_img_arroleft").val()+'"/><img class="nav" id="rightNav" src="'+$("#custpage_img_arroright").val()+'" style="margin-right:'+arrowsMargin+'%;"/>');
		manageNav(currentPosition,numberOfSlides);

		//tell the buttons what to do when clicked
		$('.nav').bind('click', function() {
			//determine new position
			currentPosition = ($(this).attr('id')=='rightNav')? currentPosition+1 : currentPosition-1;
			manageNav(currentPosition,numberOfSlides);
			moveSlide(slideWidth,currentPosition);
		});

		$('#spinner').css('display','none');
	});
	//If update --> display room details
	$('table[id^="facClass"] > tbody >tr').each(function(){
		var idRoom=$( this ).find('td:eq(5)').find('select option:selected').attr('id');
		var valRoom=$( this ).find('td:eq(5)').find('select option:selected').val();

		if(!isEmpty(idRoom))
		{
			var action='getroomdetails&room='+idRoom+'&section='+$(this).find('td:eq(0)').attr('id');
			if(method=='scratch')
			{
				action+='&year='+$("span[id^='year']").attr('id').split('_')[1];
				action+='&term='+$("span[id^='term']").attr('id').split('_')[1];
			}
			else
			{
				action+='&year='+$("span[id^='yearp']").attr('id').split('_')[1];
				action+='&term='+$("span[id^='termp']").attr('id').split('_')[1];
			}
			var t=$( this );
			var sectionId=t.find('td:eq(0)').attr('id');
			ajaxCaller(action, function(result){
				if(result)
				{
					if(result.indexOf('This room')>=0)
					{
						t.find('td:eq(5)').find('select option:selected').addClass('Booked');
						t.find('td:eq(4)').find('select').val(valRoom.split('_')[1]);
						t.find('td:eq(6)').text('-');
						var paramCall='&action=customlookup&recType=customrecord_ederp_sec&fldNames=custrecord_ederp_sec_maxoccup&recId='+sectionId;
						callCommonAjax(paramCall,function(max){
							if(max)
								t.find('td:eq(7)').text(max);
						});

					}
					else
					{
						result=result.split(',');
						var roomType=result[3];
						var roomCap=result[1];
						var maxStud=result[2];
						t.find('td:eq(4)').find('select').val(roomType);
						t.find('td:eq(6)').text(roomCap);
						t.find('td:eq(7)').text(maxStud);
					}

				}
			});

			//Filter rooms to same type and bldng
			var valBldng=valRoom.split('_')[0];
			var arrRmTypes=new Array();
			$( this ).find('td:eq(5)').find('option[value^="'+valBldng+'_"]').each(function(){
				arrRmTypes.push($( this ).val().split('_')[1]);
			});

			$( this ).find('td:eq(5)').find('option[value!="'+valRoom+'"][value!=""]').remove();

			//filter rm types 
			$( this ).find('td:eq(4)').find('select option').each(function(){
				if(arrRmTypes.indexOf($(this).val())<0 && $(this).val()!='--TBD--' )
					$(this).remove();
			});
		}
	});


	$('input[id^="checkbx_"]').on('change',function(){
		var idListFac='listFac_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
		idListFac=$('select[id^="'+idListFac+'"]').attr('id');
		var t=$(this);
		var msg='<div>Wait a moment, search of available faculty is in progress<span id="dots"></span></div>';
		msg+='<br/><img id="spinner" src="'+$("#custpage_img_ajaxloader").val()+'" alt="Loading" style="display:block;"/>';

		if(t.is(':checked'))
		{
			if($('#'+idListFac+' option').length>1)
			{
				var options = {
						width:500,
						content:msg,
						height:150,
						title:'Alert',
						ignoreDelay: true,
						closeButton:false,
						draggable:'title',
						blockScroll:false,
						closeOnClick:false,
						onOpen: function() 
						{ 
							var modal=this;
							//start processing
							var idSection=t.closest('tr').find('td:eq(0)').attr('id');
							var idFaculties=[];
							$('#'+idListFac).find('option').each(function(){
								if(!isEmpty($(this).val()))
									idFaculties.push($(this).val());
							});
							if(idFaculties.length>0)
							{
								var action='checkfacav';
								action+='&section='+idSection;
								action+='&faculties='+idFaculties;
								ajaxCaller(action,function(newOptions){
									if(newOptions)
									{
										$('#'+idListFac).empty().append(newOptions);
										$('#'+idListFac).blur();

										modal.destroy();
										$('body').css( 'cursor', 'default' );
									}

								});

							}
						}
				};

				var M=new jBox('Modal',options);
				M.open();
				setInterval (type, 400);
				$('body').css( 'cursor', 'pointer' );
				$('.jBox-Modal .jBox-title').css('background-color', colorBg);

			}
		}
		else 
		{
			var idListFac='listFac_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
			$('select[id^="'+idListFac+'"]').html(optionsFaculties);
			$('select[id^="'+idListFac+'"]').val('');
		}

	});

	var redirectSchedule = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_facsched', 'customdeploy_ederp_facultyschedule_deplo');
	redirectSchedule += '&action='+base64_encode("load");
	$('select[id^="listFac"]').on('change',function(){

		var currentIndx=this.selectedIndex;

		if(!isEmpty(this.value))
		{
			//first chech if checkbox checked
			if($(this).closest('tr').find('input[type="checkbox"]').is(':checked'))
			{


				if($(this).find('option:eq('+currentIndx+')').attr('class')=='Booked')
				{
					var action='&action=cs_facdetails&data='+$(this).find('option:eq('+currentIndx+')').attr('id')+'&fac='+$(this).val();
					var t=$(this);
					callCommonAjax(action,function(result){
						if(result)
						{
							var OverlappSection=t.find('option:eq('+currentIndx+')').attr('id').split('_')[0];
							var v=$('td[id="'+OverlappSection+'"]').closest('tr').find('td:eq(2)').find('select option:selected').val();
							if(v==t.val() || v==undefined)
							{
								messagePopup(result);
								t.val('--TBD--').change();
							}
							else
							{

								t.find('option:eq('+currentIndx+')').attr('class','FacCheck');
								var section=t.closest('tr').find('td:eq(0)').attr('id');
								var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_commonfn', 'customdeploy_softype_ederp_st_commonfn');
								//check if this faculty is already selected by session overlapping with current
								
								$('select[id^="listFac"]').find('option:selected[value="'+t.val()+'"]').each(function(){
									var this_section=$(this).closest('tr').find('td:eq(0)').attr('id');
									if(this_section!=section)
									{
										var action='&action=check_overlapping&sec1='+section+'&sec2='+this_section;
										URL+=action;
										var f=$(this);
										callCommonAjax(action,function(result){

											if(!isEmpty(result))
											{

												redirectSchedule +='&cc_faculty='+base64_encode(t.val());
												redirectSchedule +='&cc_acdyear='+base64_encode($("span[id^='year']").attr('id').split('_')[1]);
												redirectSchedule +='&cc_acdterm='+base64_encode($("span[id^='term']").attr('id').split('_')[1]);

												var namesec=f.closest('tr').find('td:eq(0)').text();
												var divMSG = '<div>This faculty is already teaching <b>'+namesec+'</b> at an overlapping time slot.</div></br>';

												/*********/
												divMSG +='<div><a href="'+redirectSchedule+'" target="_blank">Click here</a> to open the schedule of the faculty.</div></br>';
												divMSG +='<div>Below is the faculty availability calendar.</div>';
												divMSG+='<table id="coursSchedTime">';
												divMSG+='<thead><tr><td>Days Available</td><td>From</td><td>To</td></thead><tbody>';

												var param='&action=getAvFac&fac='+t.val();
												callCommonAjax(param, function(result){
													if(result)
													{
														divMSG += result;
														divMSG +='</tbody></table>';
														
														messagePopup(divMSG);
														t.val('--TBD--').change();
														return false;
													}
												});


												/*********/
												return false;
											}
										});

									}
								});
							}
						}
					});

				}
				else
				{  
					var section=$(this).closest('tr').find('td:eq(0)').attr('id');
					var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_commonfn', 'customdeploy_softype_ederp_st_commonfn');
					var t=$(this);	
					//check if this faculty is already selected by session overlapping with current
					$('select[id^="listFac"]').find('option:selected[value="'+this.value+'"]').each(function(){
						var this_section=$(this).closest('tr').find('td:eq(0)').attr('id');
						if(this_section!=section)
						{
							var action='&action=check_overlapping&sec1='+section+'&sec2='+this_section;
							URL+=action;
							var f=$(this);
							callCommonAjax(action,function(result){

								if(!isEmpty(result))
								{
									redirectSchedule +='&cc_faculty='+base64_encode(t.val());
									redirectSchedule +='&cc_acdyear='+base64_encode($("span[id^='year']").attr('id').split('_')[1]);
									redirectSchedule +='&cc_acdterm='+base64_encode($("span[id^='term']").attr('id').split('_')[1]);

									var namesec=f.closest('tr').find('td:eq(0)').text();
									var divMSG = '<div>This faculty is already teaching <b>'+namesec+'</b> at an overlapping time slot.</div></br>';
									
									/*********/
									divMSG +='<div><a href="'+redirectSchedule+'" target="_blank">Click here</a> to open the schedule of the faculty.</div></br>';
									divMSG +='<div>Below is the faculty availability calendar.</div>';
									divMSG+='<table id="coursSchedTime">';
									divMSG+='<thead><tr><td>Days Available</td><td>From</td><td>To</td></thead><tbody>';

									var param='&action=getAvFac&fac='+t.val();
									callCommonAjax(param, function(result){
										if(result)
										{
											divMSG += result;
											divMSG +='</tbody></table>';
											
											messagePopup(divMSG);
											t.val('--TBD--').change();
											return false;
										}
									});


									/*********/;
									t.val('--TBD--').change();
									return false;
								}
							});

						}
					});
				}
			}
			else
			{
				var msg='<div>This faculty may not be available at the time slot of this section.<br/>';
				msg+='To check his/her availability, select the "Show Available Faculty" check box.';
				messagePopup(msg);
				$(this).val('--TBD--').change();
			}

		}

	});

	$('select[id^="listRmType_"]').on('change',function(){

		var idRmsSelect='listRm_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
		var bldgSelected=$('#'+'listBld_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2]).val();
		$('#'+idRmsSelect).empty().append(optionsRooms);
		var typeSelected=$(this).val();
		if(typeSelected=='--TBD--')
		{
			$(this).closest('tr').find('td:eq(6)').text('');
			$('#'+idRmsSelect).find('option:not(:first)').each(function() {
				if ( parseInt($(this).val().split('_')[0]) != parseInt(bldgSelected)) 
				{
					$(this).remove();
				}
			});
		}
		else
		{
			$('#'+idRmsSelect).find('option:not(:first)').each(function() {
				if ( parseInt($(this).val().split('_')[1]) != parseInt(typeSelected) || parseInt($(this).val().split('_')[0]) != parseInt(bldgSelected)) 
				{
					$(this).remove();
				}
			});
		}
	});

	/**IN FACULTIES: FILTER LIST OF CLASSROOMS BASED ON THE BUILDING SELECTED**/
	$('select[id^="listBld"]').on('change',function(){

		var idRmsSelect='listRm_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
		var idRmsTypeSelect='listRmType_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
		var t=$(this);
		$('#'+idRmsSelect).empty().append(optionsRooms);
		$('#'+idRmsTypeSelect).empty().append(optionsRmTypes);

		var msg='<div>Wait a moment, search of available rooms is in progress...</div>';
		msg+='<br/><img id="spinner" src="'+$("#custpage_img_ajaxloader").val()+'" alt="Loading" style="display:block;"/>';
		if(!isEmpty(t.val()))
		{  
			t.closest('tr').find('td:eq(6)').text('');
			var options = {
					width:500,
					height:150,
					content:msg,
					title:'Alert',
					ignoreDelay: true,
					closeButton:false,
					draggable:'title',
					blockScroll:false,
					closeOnClick:false,
					onClose: function() 
					{

						var idBldgSelected=t.val();
						var arrType=new Array();
						$('#'+idRmsSelect).find('option:not(:first)').each(function() {
							if ( parseInt($(this).val().split('_')[0]) != parseInt(idBldgSelected)) 
							{
								$(this).remove();
							}
							else
							{
								arrType.push($(this).val().split('_')[1]);
								var action='getroomdetails&room='+$(this).attr('id')+'&section='+$(this).closest('tr').find('td:eq(0)').attr('id');
								if(method=='scratch')
								{
									action+='&year='+$("span[id^='year']").attr('id').split('_')[1];
									action+='&term='+$("span[id^='term']").attr('id').split('_')[1];
								}
								else
								{
									action+='&year='+$("span[id^='yearp']").attr('id').split('_')[1];
									action+='&term='+$("span[id^='termp']").attr('id').split('_')[1];
								}
								var r=$(this);
								ajaxCaller(action,function(res){
									if(res)
									{
										if(res.indexOf('This room is already')>=0)
											r.addClass('Booked');
									}
								});

							}
						});

						$('#'+idRmsSelect).val('');
						$('#'+idRmsTypeSelect).find('option:not(:first)').each(function() {
							if(arrType.indexOf($(this).val())<0)
								$(this).remove();
						});

						$('body').css( 'cursor', 'default' );

					},
					onCloseComplete: function() 
					{
						$('div[id^="jBox"]').remove();
					}
			};
			var M=new jBox('Modal',options);
			M.open();
			$('body').css( 'cursor', 'pointer' );
			$('.jBox-Modal .jBox-title').css('background-color', colorBg);
			setTimeout(function(){ M.close();}, 200);

		}
		else
		{
			t.closest('tr').find('td:eq(6)').text('');
			$('#'+idRmsSelect).val('');
		}
	});

	/**IN FACULTIES: AJAX CALL UPON SELECTING A CLASSROOM TO GET ROOM DETAILS**/	
	$('select[id^="listRm_"]').on('change',function(){
		var action='getroomdetails&room='+$(this).find('option:selected').attr('id')+'&section='+$(this).closest('tr').find('td:eq(0)').attr('id');
		if(method=='scratch')
		{
			action+='&year='+$("span[id^='year']").attr('id').split('_')[1];
			action+='&term='+$("span[id^='term']").attr('id').split('_')[1];
		}
		else
		{
			action+='&year='+$("span[id^='yearp']").attr('id').split('_')[1];
			action+='&term='+$("span[id^='termp']").attr('id').split('_')[1];
		}
		var t=$(this);
		if(isEmpty(t.val()))
		{
			t.closest('tr').find('td:eq(6)').text('');
		}
		else
		{
			ajaxCaller(action,function(res){
				if(res.indexOf('This room is already')>=0)
				{
					var OverlappSection=res.split('<b class="')[1].split('" >')[0];
					var v=$('td[id="'+OverlappSection+'"]').closest('tr').find('td:eq(5)').find('select option:selected').val();
					if(v==t.val() || v==undefined)
					{
						messagePopup(res);
						t.val('');
						t.closest('tr').find('td:eq(6)').text('');
					}
					else
					{
						t.find('option:selected').attr('class','RmCheck');
						var error=0;

						var section=t.closest('tr').find('td:eq(0)').attr('id');
						var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_commonfn', 'customdeploy_softype_ederp_st_commonfn');
						//check if this room is already selected by session overlapping with current
						$('select[id^="listRm"]').find('option:selected[id="'+t.find('option:selected').attr('id')+'"]').each(function(){
							var this_section=$(this).closest('tr').find('td:eq(0)').attr('id');
							var this_section_nm=$(this).closest('tr').find('td:eq(0)').text();
							if(this_section!=section)
							{
								var action='&action=check_overlapping&sec1='+section+'&sec2='+this_section;
								URL+=action;
								callCommonAjax(action,function(result){
									if(!isEmpty(result))
									{
										messagePopup('<div>This room is already taken by <b>'+this_section_nm+'</b> at an overlapping time slot.</div>');
										t.val('--TBD--');
										t.closest('tr').find('td:eq(6)').text('');
										error=1;
										return false;
									}
								});

							}
						});
						if (error==0)
						{
							action+='&skip=skip';
							ajaxCaller(action,function(result)
									{
								result=result.split(',');
								var roomType=t.val().split('_')[1];
								var roomCap=result[1];
								var maxStud=result[2];
								t.closest('tr').find('td:eq(3)').find('select').val(t.val().split('_')[0]);
								t.closest('tr').find('td:eq(4)').find('select').val(roomType);
								t.closest('tr').find('td:eq(6)').text(roomCap);
								t.closest('tr').find('td:eq(7)').text(maxStud);

								if(parseInt(roomCap)<parseInt(maxStud))
								{
									messagePopup('Section max occupancy ('+maxStud+') exceeds the capacity of selected room ('+roomCap+').');
									t.closest('tr').find('td:eq(6)').text('');
									t.val('');
								}
									});
						}


					}

				}
				else
				{
					var error=0;

					var section=t.closest('tr').find('td:eq(0)').attr('id');
					var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_commonfn', 'customdeploy_softype_ederp_st_commonfn');
					//check if this room is already selected by session overlapping with current

					$('select[id^="listRm"]').find('option:selected[id="'+t.find('option:selected').attr('id')+'"]').each(function(){
						var this_section=$(this).closest('tr').find('td:eq(0)').attr('id');
						var this_section_nm=$(this).closest('tr').find('td:eq(0)').text();
						if(this_section!=section)
						{
							var action='&action=check_overlapping&sec1='+section+'&sec2='+this_section;
							URL+=action;
							callCommonAjax(action,function(result){
								if(!isEmpty(result))
								{
									messagePopup('<div>This room is already taken by <b>'+this_section_nm+'</b> at an overlapping time slot.</div>');
									t.val('--TBD--');
									t.closest('tr').find('td:eq(6)').text('');
									error=1;
									return false;
								}
							});

						}
					});
					if (error==0)
					{
						res=res.split(',');
						var roomType=t.val().split('_')[1];
						var roomCap=res[1];
						var maxStud=res[2];
						t.closest('tr').find('td:eq(3)').find('select').val(t.val().split('_')[0]);
						t.closest('tr').find('td:eq(4)').find('select').val(roomType);
						t.closest('tr').find('td:eq(6)').text(roomCap);
						t.closest('tr').find('td:eq(7)').text(maxStud);

						if(parseInt(roomCap)<parseInt(maxStud))
						{
							messagePopup('Section max occupancy ('+maxStud+') exceeds the capacity of selected room ('+roomCap+').');
							t.closest('tr').find('td:eq(6)').text('');
							t.val('');
						}
					}

				}



			});

		}
	});

}
/**IN TIMINGS: SETS THE SELECTED ACADEMIC YEAR BY DEFAULT TO LAST OR THE ONE BEFORE LAST IF CURRENT EXISTS**/
function defaultAcadYearH()
{
	if($("#currentYear").length!=0)
		$('#listAcadYrH option').eq($("#listAcadYrH option").length - 2).attr('selected', 'selected');
	else
		$('#listAcadYrH option:last-child').attr('selected', 'selected');

}
/**GENERIC: CLOSES POPUP WITH OTHER ACTIONS DEPENDING ON STEP**/
function box_close()
{
	if(arguments.length==2)
	{
		$('.btnAP:eq(4)').attr('disabled',false);
		$('.btnAP:eq(5)').attr('disabled',false);
		$('input[type="radio"][name="method"]').attr('disabled',false);
		$('#img-spinner').hide();
		$('div[id^="jBox"]').remove();
	}
	else
	{
		var obj=arguments[0];
		if($('div[id^="jBox2"]').length!=0)//if 2 jboxes: remove only secnd one else remove all including overlay
			$(obj).closest('div[id^="jBox"]').remove();
		else
			$('div[id^="jBox"]').remove();

	}
}

/**GENERIC: OPENS POPUP**/
function messagePopup(msg)
{
	msg+='<div style="margin-left:200px; margin-top:20px;"><input class="btnAP" type="button" value="OK" onClick="box_close(this);"/></div>';
	var w = 500;
	if(msg.indexOf('This faculty is already teaching')>=0)
		w = 700;
	
	var options = {
			width:w,
			content: msg,
			title:'Alert',
			ignoreDelay: true,
			closeButton:false,
			draggable:'title',
			blockScroll:false,
			closeOnClick:false,
			onCloseComplete: function() 
			{ 
				this.destroy();
			}
	};

	var M=new jBox('Modal',options);
	M.open();
	$('.jBox-Modal .jBox-title').css('background-color', colorBg);
}

/**IN TIMINGS: HIDE ALL STEP2 WHEN CLICKING ON SCHEDULE TO RESET**/
function hideSchedule()
{
	$('#scheduler').html('');
	$('.FldGrpHdr:eq(2)').hide();
	$('#summary').hide();

	$(".button_example").hide();

	$(".btnAP:eq(6)").hide();
	$(".btnAP:eq(7)").hide();
	$(".btnAP:eq(8)").hide();
	$(".btnAP:eq(9)").hide();
	$(".btnAP:eq(10)").hide();
	$(".btnAP:eq(11)").hide();
	$(".btnAP:eq(12)").hide();
	if($('[id^="canvas_"]').length!=0)
	{
		$('[id^="canvas_"]').remove();
	}
}


/**CALENDAR: CALCULATE WIDTH OF TEXT DISPLAYED IN CANVAS**/
function getLines(ctx, text, maxWidth) {
	var words = text.split("-");
	var lines = [];
	var currentLine = words[0];

	for (var i = 1; i < words.length; i++) {
		var word = words[i];
		var width = ctx.measureText(currentLine + "-" + word).width;
		if (width < maxWidth) {
			currentLine += "-" + word;
		} else {
			lines.push(currentLine+'-');
			currentLine = word;
		}
	}
	lines.push(currentLine);
	return lines;
}

/**CALENDAR: GENERATES RANDOM NUMBER**/
function rand(min, max) {
	return parseInt(Math.random() * (max-min+1), 10) + min;
}

/**CALENDAR: GENERATES RANDOM COLORS**/

/**CALENDAR: GENERATES RANDOM COLORS**/
function rainbow() {
	function randomChannel(brightness){
		var r = 255-brightness;
		var n = 0|((Math.random() * r) + brightness);
		var s = n.toString(16);
		return (s.length==1) ? '0'+s : s;
	}
	return '#' + randomChannel(150) + randomChannel(150) + randomChannel(150);
}


/**CALENDAR: ADD SECTIONS TO CALENDAR**/
function addToCalendar(section,idsection,arrCSTime)
{
	var color;
	if($('[id^="canvas_'+idsection+'_"]').length!=0)
	{
		color=$('[id^="canvas_'+idsection+'_"]').css('backgroundColor');
		$('[id^="canvas_'+idsection+'_"]').remove();
	}
	else
		color=rainbow();

	//loop depending on days and timings
	for(var i=0; i<arrCSTime.length; i++)
	{
		$("#calendar tr td.days").each(function () {
			var day=$(this).text().toLowerCase().trim();
			if(day == arrCSTime[i][0].toLowerCase())
			{
				var startTime=""+arrCSTime[i][1];
				var endTime=""+arrCSTime[i][2];
				var idName="_"+day+"_"+arrCSTime[i][1].split(':')[0]+arrCSTime[i][1].split(':')[1]+"_"+arrCSTime[i][2].split(':')[0]+arrCSTime[i][2].split(':')[1];
				var index;
				$("#calendar tr td.timings").each(function () {

					var time=startTime.split(':')[0]+":00";
					if($(this).text().trim()==time)
						index=$(this).parent().index();				 
				});
				var startingMin=parseInt(startTime.split(':')[1]);
				startTime = new Date(0, 0, 0, startTime.split(':')[0], startTime.split(':')[1], 0, 0);
				endTime = new Date(0, 0, 0, endTime.split(':')[0], endTime.split(':')[1], 0, 0);
				var diff = endTime - startTime;

				var diffSeconds = diff/1000;
				var MM = Math.floor(diffSeconds%3600)/60;
				var coeffH=diffSeconds/3600;
				var coeffT=0.5;


				if(startingMin==30)
					coeffT=1;
				if(startingMin==15)
					coeffT=0.75;
				if(startingMin==45)
					coeffT=1.25;	


				var c=$("#calendar").find("tbody > tr:nth-child("+(index+1)+") >td:nth-child("+($(this).index()+1)+")");
				var d=document.createElement("canvas");
				d.width = c.innerWidth()+2;
				d.height = c.innerHeight()*coeffH +2 + parseInt(coeffH);
				d.id="canvas_"+idsection+idName;
				d.style.left = (c.offset().left)+"px";
				d.style.top = (c.offset().top + coeffT*c.innerHeight())+"px";
				d.style.position = "absolute";
				d.addEventListener('click', function() { 
					$('[id^="canvas_'+idsection+'_"]').css('z-index',z++);
				}, false);
				d.addEventListener("dblclick", function()
						{
					showTablePopup(day);
						}
				, false);

				//check if already existing in same time slot
				if($('canvas[id$="'+idName+'"]').length!=0)
				{
					d.style.border="1px solid rgb(128, 128, 128)";
					d.width-=9;
					d.height-=9;
					d.style.top=(c.offset().top + coeffT*c.innerHeight() +3)+"px";
					d.style.left=(c.offset().left + 3)+"px";
					d.style.boxShadow="rgb(208, 208, 208) 0px 0px 3px 3px";

				}

				$('body').append(d);
				var ctx=d.getContext('2d');
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.fillStyle = '#00005C';
				ctx.textBaseline = 'top';
				ctx.font = '13px Open Sans';

				var txtLines;
				if(section.indexOf('/')<0)
					txtLines=getLines(ctx, section, d.width );
				else
					txtLines=getLines(ctx, section.split('/')[0], d.width );
				for(var j=1; j<=txtLines.length; j++)
					ctx.fillText(txtLines[j-1], 2, 2+(j-1)*14);
				if(section.indexOf('/')>=0)
				{
					ctx.fillText(section.split('/')[1], 2, (j-1)*14);
					ctx.fillText(section.split('/')[2], 2, (j-1)*14*2);
				}

				d.style.background = color;

			}
		});

	}
	$('.courses td[id="'+idsection+'"]').closest('tr').css('background-color','#fefeee');
}

/**CALENDAR: DISPLAYS DETAILS OF WHOLE DAY UPON CLICKING ON CANVAS**/
function showTablePopup(day)
{
	var step=3;
	var html='';

	//check where
	var x=$('canvas[id*="'+day+'"]').eq(0).attr('id').split('_');
	if(isEmpty($('#'+x[1]).text()))
		step=5;

	if(step==5)
	{
		html+='<table id="coursSchedTime" style="width:600px;">';
		html+='<thead><tr><td>Section</td><td>Start Time</td><td>End Time</td><td>Faculty</td><td>Room</td></tr></thead><tbody>';
		$('canvas[id*="'+day+'"]').each(
				function(){
					var id=$(this).attr('id').split('_');
					var secName=getName(id_nameSections_preview, parseInt(id[1]));
					id[3]=id[3].substring(0,2)+':'+id[3].substring(2,4);
					id[4]=id[4].substring(0,2)+':'+id[4].substring(2,4);
					html+='<tr>';
					html+='<td>'+secName+'</td>';
					html+='<td>'+id[3]+'</td>';
					html+='<td>'+id[4]+'</td>';
					html+='<td>'+getName(id_nameSections_preview, parseInt(id[1]),2)+'</td>';
					html+='<td>'+getName(id_nameSections_preview, parseInt(id[1]),3)+'</td>';
					html+='</tr>';
				});
	}
	else
	{
		html+='<table id="coursSchedTime">';
		html+='<thead><tr><td>Section</td><td>Start Time</td><td>End Time</td></tr></thead><tbody>';
		$('canvas[id*="'+day+'"]').each(
				function(){
					var id=$(this).attr('id').split('_');
					var secName=$('.courses td[id="'+id[1]+'"]').text();
					id[3]=id[3].substring(0,2)+':'+id[3].substring(2,4);
					id[4]=id[4].substring(0,2)+':'+id[4].substring(2,4);
					html+='<tr>';
					html+='<td>'+secName+'</td>';
					html+='<td>'+id[3]+'</td>';
					html+='<td>'+id[4]+'</td>';
					html+='</tr>';
				});
	}


	html+='</tbody></table>';

	switch (day)
	{
	case 'mon' :
		day='Monday';
		break;
	case  'tue' :
		day= 'Tuesday';
		break;
	case  'wed' :
		day= 'Wednesday';
		break;
	case  'thu' :
		day= 'Thursday';
		break;
	case  'fri' :
		day= 'Friday';
		break;
	case  'sat' :
		day= 'Saturday';
		break;
	}

	var w=step==5?700:500;
	var options = {
			width:w,
			height:220,
			content: html,
			title:day+' Schedule',
			ignoreDelay: true,
			closeButton:true,
			draggable:'title',
			blockScroll:false,
			onCloseComplete: function() 
			{ 
				this.destroy();
			}
	};

	var M=new jBox('Modal',options);
	M.open();
	$('.jBox-Modal .jBox-title').css('background-color', colorBg);
}

/**CALENDAR: GET NAME OF SECTION FROM HIDDEN RESULT ARRAY**/
function getName(arr,id)
{
	if(arguments.length==2)
	{
		for(var i=0; i<arr.length; i++)
			if(parseInt(arr[i][0])==parseInt(id))
				return arr[i][1];
	}
	else
	{
		var obj=arguments[2];
		for(var i=0; i<arr.length; i++)
			if(parseInt(arr[i][0])==parseInt(id))
				return isEmpty(arr[i][obj])?'--TBD--':arr[i][obj];
	}

	return '';
}

/**IN TIMINGS: GET LIST OF COURSES TO POPULATE THE 'COURSES' FIELD USING 'AUTOCOMPLETE' LIBRARY**/
function getCourses()
{
	var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
	URL+="&action=getcourses";
	if(arguments.length==1)
		URL+='&term='+arguments[0];

	$.ajax({
		url: URL,
		async: false
	})
	.done(function( data ) {
		if(data.length != 0 )
		{
			data=data.split(',');
			var jsonArr = [];

			for (var i = 0; i < data.length; i++) {
				var temp=data[i].split(':');
				jsonArr.push({value:temp[0],data:temp[1]});
				if($('#autocomplete').val()!='' && $('#autocomplete').val()==temp[0])
				{
					selectedCourseId=temp[1];
				}
				else if($('#autocompleteH').val()!='' && $('#autocompleteH').val()==temp[0])
				{
					selectedCourseId=temp[1];
				}
			}

			//Initialize autocomplete with local lookup:
			$('#autocompleteH').autocomplete({
				lookup:jsonArr,
				minChars: 0,
				onSelect: function (suggestion) {
					if(!isEmpty(suggestion.data))
					{
						callCommonAjax('&action=getDescription&item='+parseInt(suggestion.data),function(desc){
							if(desc)
								$('#descFldH').text(desc);
							if($('#listTermsP').val()!='' && !isEmpty(suggestion.data) && $('#listAcadYrP').val()!='')
								getPrograms(suggestion.data);
							selectedCourseId=suggestion.data;
						});
					}
				},
				showNoSuggestionNotice: true,
			});
			$('#autocomplete').autocomplete({
				lookup:jsonArr,
				minChars: 0,
				onSelect: function (suggestion) {
					if(!isEmpty(suggestion.data))
					{
						callCommonAjax('&action=getDescription&item='+parseInt(suggestion.data),function(desc){
							if(desc)
								$('#descFld').text(desc);
							if($('#listTerms').val()!='' && !isEmpty(suggestion.data) && $('#listAcadYr').val()!='')
								getPrograms(suggestion.data);
							selectedCourseId=suggestion.data;
						});
					}
				},
				showNoSuggestionNotice: true,
			});
			$('#autocomplete').val('');
			$('#autocompleteH').val('');
		}
		else
		{

			$('#autocomplete').autocomplete({
				lookup:[],
				minChars: 0,
				showNoSuggestionNotice: true
			});
			$('#autocompleteH').autocomplete({
				lookup:[],
				minChars: 0,
				showNoSuggestionNotice: true
			});
		} 

	});


}

/**IN TIMINGS: GET LIST OF PROGRAMS BASED ON THE COURSE AND TERM SELECTED, FROM 'COURSE'==='SERVICEITEM' RECORD**/
function getPrograms(course)
{
	if(!isEmpty(course))
	{
		var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
		URL+='&action=getprograms&course='+course;
		if(method=='scratch')
			URL+='&term='+$("#listTerms").val()+'&year='+$("#listAcadYr").val();
		else
			URL+='&term='+$("#listTermsP").val()+'&year='+$("#listAcadYrP").val();

		$.ajax({
			url: URL,
			async: false
		})
		.done(function( data ) {
			if(data.length != 0 )
			{
				var text='';
				data=data.split(',');
				for(var i=0;i<data.length;i++)
					text+='-'+ data[i] +'\n';
				if(method=='scratch')
					$('#listPrograms').val(text);
				else
					$('#listProgramsH').val(text);
			}
			else
			{
				if(method=='scratch')
					$('#listPrograms').val('--No approved section plans found--');
				else
					$('#listProgramsH').val('--No approved section plans found--');
			}

		});



	}

}

/**IN TIMINGS: DISPLAY COMPARISON SUMMARY FOR THE SCHEDULING FROM HISTORICAL**/
function getSummary(param)
{
	var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
	URL+="&action=getsummary"+param+"&goingbck="+goingBack;
	$.ajax({
		url: URL
	})
	.complete(function( data ) {
		if(data)
		{   
			data=data.responseText;
			if(data.indexOf('There is no approved course')>=0 || data.indexOf('There is already a course schedule created')>=0)
			{
				messagePopup(data);
				$(".btnAP:eq(4)").attr('disabled',false);
				$(".btnAP:eq(5)").attr('disabled',false);
				$('#img-spinner').css('display','none');
				$('input[type="radio"][name="method"]').attr('disabled',false);
			}
			else
			{
				$('.FldGrpHdr:eq(2)').show("slow");
				$('#summaryDiv').show("slow", function(){
					$(".btnAP:eq(4)").css('disabled',true);
					$(".btnAP:eq(5)").css('disabled',true);

					$(".button_example").show();
					$(".btnAP:eq(6)").show();
					$(".btnAP:eq(7)").show();
					$(".btnAP:eq(8)").show();
					$(".btnAP:eq(9)").show();
					$(".btnAP:eq(10)").show();
					$(".btnAP:eq(11)").show();
					$(this).append(data);
					$('caption').css('background-color', colorBg);
					displayCalendar('x','y');
				});
			}
		}
	});

}

/**IN TIMINGS: CHECKS ALL MANADATORY FIELDS EXISTING AND CALL CALENDAR DISPLAY**/
function schedule()
{
	if(method=='scratch' && (isEmpty($("#listTerms").val()) || isEmpty($("#autocomplete").val()) || isEmpty($("#listAcadYr").val())) )
	{
		messagePopup('Please select an item for all mandatory fields.');
	}
	else if(method=='historical' && (isEmpty($("#listTermsH").val()) || isEmpty($("#listAcadYrH").val()) || isEmpty($("#listTermsP").val()) || isEmpty($("#autocompleteH").val()) || isEmpty($("#listAcadYrP").val())) )
	{
		messagePopup('Please select an item for all mandatory fields.');
	}
	else if((method=='historical' && $("#listProgramsH").val()=='--No approved section plans found--') || (method=='scratch' && $("#listPrograms").val()=='--No approved section plans found--'))
	{
		messagePopup('<div>There is no approved course section plan found under selected academic year and term to schedule.<br/><br/>Select different parameters to proceed.</div>');
	}
	else if((method=='historical' && isEmpty($('#descFldH').text())) || (method=='scratch' && isEmpty($('#descFld').text())))
	{

		messagePopup('The course selected is not available.');
	}
	else
	{
		//IE 
		if (!Array.prototype.indexOf) 
		{
			Array.prototype.indexOf = function(obj, start) {
				for (var i = (start || 0), j = this.length; i < j; i++) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}


		//also hide fieldgroup and buttons
		$('#scheduler').html('');
		$('#img-spinner').css("display", "block");
		$('#summaryDiv').html('');
		$('.FldGrpHdr:eq(2)').hide();
		$(".btnAP:eq(4)").attr("disabled", true);
		$(".btnAP:eq(5)").attr("disabled", true);
		$('input[type="radio"][name="method"]').attr('disabled',true);
		$(".button_example").hide();

		$(".btnAP:eq(6)").hide();
		$(".btnAP:eq(7)").hide();
		$(".btnAP:eq(8)").hide();
		$(".btnAP:eq(9)").hide();
		$(".btnAP:eq(10)").hide();
		$(".btnAP:eq(11)").hide();
		$(".btnAP:eq(12)").hide();
		$('body').css( 'cursor', 'pointer' );
		if($('[id^="canvas_"]').length!=0)
			$('[id^="canvas_"]').remove();

		if(arguments.length>0)
			displayCalendar(arguments[0]); 
		else
			displayCalendar();
		$('body').css( 'cursor', 'default' );

	}

}

/**IN TIMINGS: AJAX CALL UPON CLICKING ON 'SCHEDULE' BUTTON TO GET TABLES AND CALENDAR**/
function displayCalendar()
{
	var checkDraft=true;
	if(arguments.length==1)
		checkDraft=arguments[0];

	//Param
	var param='';
	if(method=='scratch')
		param="&course="+selectedCourseId+"&term="+$("#listTerms").val()+"&year="+$("#listAcadYr").val();
	else
		param="&course="+selectedCourseId+"&termP="+$("#listTermsP").val()+"&yearP="+$("#listAcadYrP").val()+"&termH="+$("#listTermsH").val()+"&yearH="+$("#listAcadYrH").val();

	if(method=='historical' && arguments.length!=2)
	{
		getSummary(param);
		return;
	}


	if(method=='scratch' || (method=='historical' && arguments.length==2))
	{
		arrGrpDays=new Array();
		ajaxCaller('getdays',function(result){
			if(result)
				arrDays=result.split(',');
		});

		ajaxCaller('gettimes',function(result){
			if(result)
				arrTimes=result.split(',');
		});
		var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
		URL+="&action=getsections&checkdraft="+checkDraft+"&method="+method+param;

		$.ajax({
			url: URL,
		})
		.complete(function( data ) {
			if(data.length != 0 )
			{
				data=data.responseText;
				if(data.indexOf('There are no')>=0)
				{
					$('#img-spinner').css("display", "none");
					messagePopup(data); 
					$('input[type="radio"][name="method"]').attr('disabled',false);
					$(".btnAP:eq(4)").attr('disabled',false);
					$(".btnAP:eq(5)").attr('disabled',false);
				}
				else if(data.indexOf('Contact your administrator')>=0)
				{
					$('#img-spinner').css("display", "none");
					messagePopup(data); 
					$('input[type="radio"][name="method"]').attr('disabled',false);
					$(".btnAP:eq(4)").attr('disabled',false);
					$(".btnAP:eq(5)").attr('disabled',false);
				}
				else
				{ 
					if (data.indexOf('Click OK')>=0)
					{
						var res=data;
						res+='<br/><img id="spinner" src="'+$("#custpage_img_ajaxloader").val()+'" alt="Loading"/>';
						res+='<div id="btnModalY"><input class="btnAP" type="button" onClick="click_OK(this);" value="OK"/>';
						res+='<input id="btnCancel" class="btnAP" type="button" onClick="box_close(\'1\',\'1\');" value="Cancel"/></div>';
						var options = {
								width:500,
								height:220,
								content: res,
								title:'Alert',
								ignoreDelay: true,
								closeButton:false,
								draggable:'title',
								blockScroll:false,
								closeOnClick:false
						};
						var M=new jBox('Modal',options);
						M.open();
						$('.jBox-Modal .jBox-title').css('background-color', colorBg); 
					}
					else
					{
						$('body').css( 'cursor', 'pointer' );

						callCommonAjax('&action=getgrpdays',function(temp){
							if(temp)
							{
								temp=temp.split('!');
								for(var x=1; x<temp.length; x=x+2)
									arrGrpDays.push(temp[x]);
							}
						});


						$('.FldGrpHdr:eq(2)').show();
						if(method=='scratch')
						{
							$("#listTerms").prop('disabled', 'disabled');
							$("#autocomplete").prop('disabled', 'disabled');
							$("#listAcadYr").prop('disabled', 'disabled');
						}
						else if(method=='historical')
						{

							$("#listTermsH").prop('disabled', 'disabled');
							$("#listAcadYrH").prop('disabled', 'disabled');
							$("#listTermsP").prop('disabled', 'disabled');
							$("#autocompleteH").prop('disabled', 'disabled');
							$("#listAcadYrP").prop('disabled', 'disabled');

						}

						$(":button").css("visibility", "visible");
						$(".btnAP:eq(4)").attr('disabled',true);
						$(".btnAP:eq(5)").attr('disabled',true);
						$(".button_example").show();
						$(".btnAP:eq(6)").show();
						$(".btnAP:eq(7)").show();
						$(".btnAP:eq(8)").show();
						$(".btnAP:eq(9)").show();
						$(".btnAP:eq(10)").show();
						$(".btnAP:eq(11)").show();
						// Means we have an array at the end
						if(data.indexOf('!!??')>=0)
							$('#scheduler').append(data.split('!!??')[0]);
						else
							$('#scheduler').append(data);

						$(".btnAP:eq(3)").hide();
						$(".btnAP:eq(12)").hide();
						$('caption').css('background-color', colorBg);
						var currentPosition = 0;
						var slideWidth = 420;
						var slides = $('.slide');

						var numberOfSlides = slides.length;
						slides.wrapAll('<div id="slidesHolder"></div>');
						//slides.css({ 'float' : 'left' });


						//set #slidesHolder width equal to the total width of all the slides
						$('#slidesHolder').css('width', slideWidth * numberOfSlides);
						if($(".nav").length == 0)
						{
							$('#slideshower').prepend('<img class="nav" id="leftNav" src="'+$("#custpage_img_arroleft").val()+'" /><img class="nav" id="rightNav" src="'+$("#custpage_img_arroright").val()+'"/>');
						}

						$('#leftNav').css("padding-right", "0px");
						manageNav(currentPosition,numberOfSlides);
						$('#img-spinner').css("display", "none");
						$('body').css( 'cursor', 'default' );
						//tell the buttons what to do when clicked
						$('.nav').bind('click', function() {
							//determine new position
							currentPosition = ($(this).attr('id')=='rightNav')? currentPosition+1 : currentPosition-1;
							manageNav(currentPosition,numberOfSlides);
							moveSlide(slideWidth,currentPosition);
						});


						var numColumns=$("table[id^='course']").eq(0).find("thead > tr:eq(0) > td").length;
						if(numColumns==3)
							$('table[id^="course"] td').css("width", "33%");


						if(data.indexOf('!!??')>=0)
						{
							if(method=='scratch')
							{
								$(".btnAP:eq(3)").show();
								$(".btnAP:eq(12)").show();
							}

							var arrToAddCalendar=data.toString().split('!!??')[1].split(',');
							var temp=[];
							var current_idSec=arrToAddCalendar[0].split(';')[1];
							var current_sec=arrToAddCalendar[0].split(';')[0];
							for(var arr=0; arr<arrToAddCalendar.length; arr++)
							{
								var line=arrToAddCalendar[arr].split(';');
								if(current_idSec!=line[1])
								{
									addToCalendar(current_sec,current_idSec,temp);
									temp=[];
									current_idSec=line[1];
									current_sec=line[0];
								}
								temp.push([line[2],line[3],line[4]]);

							}
						}

						$('div[id^="jBox"]').remove();		
						$('body').css( 'cursor', 'default' );	
					}


				}

			}

		});


	}
}

/**STEP2: DISABLE FIELDS IN STEP2 AND DISPLAY CALENDAR UPON CLICKING ON OK OF ALERT MSG**/
function click_OK(obj)
{
	$(obj).attr('disabled',true);
	$('#spinner').css("display", "block");
	$('#img-spinner').hide();
	$('body').css( 'cursor', 'pointer' );
	displayCalendar(false);
}

/**STEP4: DISABLE SCHEDULE OF SECTION UPON CLICKING ON SETION IN FACULTY AND CLASSROOM**/
function dispSched(obj)
{
	var section=$(obj).closest('td').text();
	var html='';
	html+='<table id="coursSchedTime">';
	html+='<thead><tr><td>Day</td><td>Start Time</td><td>End Time</td></thead><tbody>';
	$('body').css( 'cursor', 'wait' );
	callCommonAjax('&action=section_schedule&section='+$(obj).closest('td').attr('id'), function(htmlBody){
		if(htmlBody)
		{
			html+=htmlBody;
			html+='</tbody></table>';
			var options = {
					width:500,
					height:220,
					content: html,
					title:'Schedule of <b>'+section+'</b>',
					ignoreDelay: true,
					closeButton:true,
					draggable:'title',
					blockScroll:false,
					onCloseComplete: function() 
					{ 
						this.destroy();
					}
			};

			var M=new jBox('Modal',options);
			M.open();
			$('.jBox-Modal .jBox-title').css('background-color', colorBg);
			$('body').css( 'cursor', 'initial' );
		}

	});

}

/**IN TIMINGS: UPON CLICKING ON SAVE BUTTON , GET DATA AND SAVE THEN GO TO PAGE2**/
function onSave()
{
	var mode=arguments[0];
	var nextWithSaving=true;
	if(arguments.length==2)
	{
		mode='nextwithoutsv';
		nextWithSaving=false;
	}
	var scheduleMissing=false;
	if(mode=='next' ||  mode=='nextwithoutsv')
	{
		var listeSecToSched='';
		$('table[id^="course"] > tbody >tr').each(function(){
			var id=$( this ).find('td:eq(0)').attr('id');
			if($('[id^="canvas_'+id+'_"]').length==0)
			{
				listeSecToSched+='<br/>'+$( this ).find('td:eq(0)').text();
				$('.btnAP:eq(3)').hide();
				$('.btnAP:eq(12)').hide();
				scheduleMissing=true;
			}
		});
		if(scheduleMissing)
		{
			messagePopup('<div>To proceed, schedule: '+listeSecToSched+'</div>');
			return false;
		}
	}

	if(!scheduleMissing)
	{
		var action='saving';
		var arrCourseSchedTime=[];
		if(nextWithSaving)
		{
			if(method=='scratch')
			{
				$('[id^="canvas_"]').each(function(){
					var id=$( this ).attr('id').split('_');
					arrCourseSchedTime.push(id[1]+':'+id[2]+':'+id[3]+':'+id[4]);
				});
			}
			else
			{
				$('[id^="canvas_"]').each(function(){
					if($( this ).attr('id').indexOf('remove')<0)
					{
						var id=$( this ).attr('id').split('_');
						arrCourseSchedTime.push(id[1]+':'+id[2]+':'+id[3]+':'+id[4]);
					}
				});
			}

		}
		var url=getNetsuiteURL();
		url =nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
		url+='&action='+action;
		url+='&mode='+base64_encode(mode);
		url+='&method='+base64_encode(method);
		if(method=='scratch')
		{
			url+='&term='+base64_encode($("#listTerms").val());
			url+='&year='+base64_encode($("#listAcadYr").val());
		}
		else
		{
			url+='&termP='+base64_encode($("#listTermsP").val());
			url+='&yearP='+base64_encode($("#listAcadYrP").val());
			url+='&termH='+base64_encode($("#listTermsH").val());
			url+='&yearH='+base64_encode($("#listAcadYrH").val());
		}
		url+='&course='+base64_encode(selectedCourseId);
		url+='&arr='+arrCourseSchedTime;
		url+='&compid='+nlapiGetContext().getCompany();
		window.ischanged = false;  
		window.open(url,'_self');	
	}	

}

/**GENERIC: FIRST LETTER CAP**/
function capitaliseFirstLetter(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**IN TIMINGS: CHECKS VALIDITY OF THE DAYS AND TIMINGS ENTERED IN THE JBOX POPUP FOR TIME SCHEDULING**/
function saveCrseSchedTime(index,numCol)
{
	var arrCSTimetext=[];
	var arrCSTime=[];
	var error=false;
	var idPrimary=0;
	var arrTimePrim=new Array();
	var obj=$('.slide:eq('+index+') > table[id^="course"]').find('input[type="checkbox"]:checked');

	//if group days : check total count of days == number of classes per week
	var numClasses,daysCount=0;
	if(numCol==3 || numCol==5)
	{
		numClasses=obj.eq(0).closest('tr').find('td:eq(1)').text();
		var numberOfPrimary = $('.slide:eq(0) > table[id^="course"]').find('tbody > tr').length;
		if(numberOfPrimary == 1)
		{
			idPrimary=$('.slide:eq(0) > table[id^="course"]').find('tbody > tr:eq(0) > td:eq(0)').attr('id');
			if($('[id^="canvas_'+idPrimary+'_"]').length!=0 && obj.eq(0).closest('tr').find('td:eq(0)').attr('id')!=idPrimary)
			{
				$('[id^="canvas_'+idPrimary+'_"]').each(function() {
					var idCanvas=$( this ).attr('id');
					var day=$('.days:contains("'+capitaliseFirstLetter(idCanvas.split('_')[2])+'")').attr('id');
					var sTime=idCanvas.split('_')[3];
					var eTime=idCanvas.split('_')[4];
					arrTimePrim.push([day,sTime,eTime]);
				});
			}
		}
	}
	else
	{
		numClasses=obj.eq(0).closest('tr').find('td:eq(2)').text(); 
		idPrimary=$('.slide:eq('+index+') > table[id^="course"]').find('tr[class="primary"] > td:eq(0)').attr('id');
		if($('[id^="canvas_'+idPrimary+'_"]').length!=0 && obj.eq(0).closest('tr').find('td:eq(0)').attr('id')!=idPrimary)
		{
			$('[id^="canvas_'+idPrimary+'_"]').each(function() {
				var idCanvas=$( this ).attr('id');
				var day=$('.days:contains("'+capitaliseFirstLetter(idCanvas.split('_')[2])+'")').attr('id');
				var sTime=idCanvas.split('_')[3];
				var eTime=idCanvas.split('_')[4];
				arrTimePrim.push([day,sTime,eTime]);
			});
		}
	}


	$("#coursSchedTime > tbody > tr").each(function(){
		var valDay = $('td:eq(0) select', this).val();
		var valStime = $('td:eq(1) select', this).val();
		var valEtime = $('td:eq(2) select', this).val();
		if(isEmpty(valDay) || isEmpty(valStime) || isEmpty(valEtime))
		{
			messagePopup('Schedule all required classes per week for this course section.');
			error=true;
			return false;
		}
		else
		{
			if(valDay.indexOf(',')>=0)
			{
				valDay=valDay.split(',');
				for(var d=0; d<valDay.length; d++)
				{
					var day=$('.days:contains("'+valDay[d]+'")').attr('id');
					if(day==undefined)
					{
						messagePopup('One of the days in this group is set to inactive or it is made a holiday for your institution.');
						error=true;
						return false;
					}
					else
					{
						var textStime = $('td:eq(1) select option:selected', this).text();
						textStime = textStime.substring(0,2)+textStime.substring(3,5);
						var textEtime = $('td:eq(2) select option:selected', this).text();
						textEtime = textEtime.substring(0,2)+textEtime.substring(3,5);
						if(!searchSimilarSched(arrTimePrim,day,textStime,textEtime))
						{
							messagePopup('Section of the primary course component within this group has been scheduled at overlapping timings.');
							error=true;
							return false;
						}
						arrCSTimetext.push([valDay[d],$('td:eq(1) select option:selected', this).text(),$('td:eq(2) select option:selected', this).text()]);
					}

				}
				daysCount+=valDay.length;
			}
			else
			{
				if(arrCSTime.length==0)
				{
					arrCSTime.push([valDay,valStime,valEtime]);
					arrCSTimetext.push([$('td:eq(0) select option:selected', this).text(),$('td:eq(1) select option:selected', this).text(),$('td:eq(2) select option:selected', this).text()]);
				}
				else
				{
					if(!searchSimilarSched(arrCSTime,valDay,valStime,valEtime))
					{
						messagePopup('Time of this class is overlapping with another class of this section.\nSelect another time slot or change the timings of the previous section first.');
						$('td:eq(1) select', this).val('');
						$('td:eq(2) select', this).val('');
						error=true;
						return false;
					}
					else
					{
						arrCSTime.push([valDay,valStime,valEtime]);
						arrCSTimetext.push([$('td:eq(0) select option:selected', this).text(),$('td:eq(1) select option:selected', this).text(),$('td:eq(2) select option:selected', this).text()]);
					}
				}

			}
			//check if this timing is overlapping with timings of Primary if exists
			if(idPrimary!=0)
			{
				//var textDay = $('td:eq(0) select option:selected', this).text().toLowerCase();
				var textStime = $('td:eq(1) select option:selected', this).text();
				textStime = textStime.substring(0,2)+textStime.substring(3,5);
				var textEtime = $('td:eq(2) select option:selected', this).text();
				textEtime = textEtime.substring(0,2)+textEtime.substring(3,5);
				if(!searchSimilarSched(arrTimePrim,valDay,textStime,textEtime))
				{
					messagePopup('Section of the primary course component within this group has been scheduled at overlapping timings.');
					error=true;
					return false;
				}
			}

		}

	});

	if(!error)
	{
		if(daysCount>0 && numClasses!=daysCount)
		{
			messagePopup('The number of days scheduled is not equal to number of classes per week');
			return;
		}

		$('div[id^="jBox"]').remove();
		obj.each(function(){
			var nameSection=$(this).closest('tr').find('td:eq(0)').text();
			var idSection=$(this).closest('tr').find('td:eq(0)').attr('id');
			addToCalendar(nameSection,idSection,arrCSTimetext);
		});
		$(".btnAP:eq(0)").prop("disabled", false);
		$(".btnAP:eq(1)").prop("disabled", false);
		$(".btnAP:eq(9)").prop("disabled", false);
		$(".btnAP:eq(10)").prop("disabled", false);
		un_markAll(0);
	}

	return; 
}

/**IN TIMINGS: CHECKS OVERLAPPED TIMINGS IN THE LIST OF POPUP WHEN DAY IS SAME**/
function searchSimilarSched(myArray,day,stime,etime)
{

	for(var i = 0; i < myArray.length; i++) 
	{
		var dayGet=parseInt(myArray[i][0]);
		var stimeGet=parseInt(myArray[i][1]);
		var etimeGet=parseInt(myArray[i][2]);
		if(dayGet == parseInt(day) && ((stimeGet<=parseInt(stime) && parseInt(stime)<etimeGet) || (parseInt(stime)<stimeGet && parseInt(etime)>stimeGet) )) 
		{
			return false;
		}
	}

	return true;
}

/**IN TIMINGS: CHECKS TIME SELECTED IN POPUP AND CALCULATE THE END TIME**/
function checkTime(obj,compDuration)
{
	var startTime=$(obj).closest('tr').find('td:eq(1)').find('select').val();
	var endTime=$(obj).closest('tr').find('td:eq(2)').find('select').val();
	if(!isEmpty(startTime) && !isEmpty(endTime))
	{
		startTime=$(obj).closest('tr').find('td:eq(1)').find('select option:selected').text();
		endTime=$(obj).closest('tr').find('td:eq(2)').find('select option:selected').text();

		startTime=startTime.toString();
		endTime=endTime.toString();

		var start=startTime.split(':');
		var end=endTime.split(':');

		startTime=start[0]+start[1];
		endTime=end[0]+end[1];

		var idTimeSelected=$(obj).closest('tr').find('td:eq(1)').find('select').val();
		$(obj).closest('tr').find('td:eq(2)').find('select').empty().append(genericOptTimes);
		$(obj).closest('tr').find('td:eq(2)').find('select option').each(function() {
			if ( parseInt($(this).val()) <= parseInt(idTimeSelected )) {
				$(this).remove();
			}
			else
			{ 
				var tempTime=parseInt($(this).text().split(':')[0])+':'+$(this).text().split(':')[1];
				var tempStart=parseInt(start[0])+parseInt(compDuration);
				if(compDuration.indexOf('.')>=0)
				{

					var d=(parseFloat(compDuration)-parseInt(compDuration))*60;
					var x=parseInt(d)+parseInt(start[1]);
					if(x>=60)
					{
						if(x==60)
							tempStart=(tempStart+1)+':'+'00';
						else
							tempStart=(tempStart+1)+':'+(x-60);
					}
					else
					{
						tempStart=tempStart+':'+x;
					}
				}
				else
					tempStart=tempStart+':'+start[1];
				if(tempTime==tempStart)
				{
					$(this).attr('selected', 'selected');
					return false;
				}

			}
		});
		$("#savePopup").prop("disabled", false);
	}
	else if(!isEmpty(startTime))
	{
		//Will only work as long as the times in the record are sorted properly
		//Filter the end Time based on the start time selected
		var startTime=$(obj).closest('tr').find('td:eq(1)').find('select option:selected').text();
		startTime=startTime.split(':');

		var idTimeSelected=$(obj).closest('tr').find('td:eq(1)').find('select').val();
		$(obj).closest('tr').find('td:eq(2)').find('select').empty().append(genericOptTimes);
		$(obj).closest('tr').find('td:eq(2)').find('select option').each(function() {
			if ( parseInt($(this).val()) <= parseInt(idTimeSelected )) {
				$(this).remove();
			}
			else
			{
				var tempTime=parseInt($(this).text().split(':')[0])+':'+$(this).text().split(':')[1];
				var tempStart=parseInt(startTime[0])+parseInt(compDuration);
				if(compDuration.indexOf('.')>=0)
				{
					var d=(parseFloat(compDuration)-parseInt(compDuration))*60;
					var x=parseInt(d)+parseInt(startTime[1]);
					if(x>=60)
					{
						if(x==60)
							tempStart=(tempStart+1)+':'+'00';
						else
							tempStart=(tempStart+1)+':'+(x-60);
					}
					else
					{
						tempStart=tempStart+':'+x;
					}
				}
				else
					tempStart=tempStart+':'+startTime[1];
				if(tempTime==tempStart)
				{
					$(this).attr('selected', 'selected');
					return false;
				}
			}
		});
	}
}

/**IN TIMINGS: ENABLES SAVING BUTTON IN POPUP ONLY WHEN CHANGE WAS MADE**/
function enableBtn()
{
	$("#savePopup").prop("disabled", false);
}

/**IN TIMINGS: OPENS JBOX POPUP FOR TIME SCHEDULING FOR EVERY SECTION**/
function openPopup()
{
	var numColumns=$("table[id^='course']").eq(0).find("thead > tr:eq(0) > td").length;
	var Title='Choose a day and time for every class';
	var slidesWidth=420;
	var index=parseInt(Math.abs($('#slidesHolder').css('margin-left').replace('px', '')))/slidesWidth;
	var obj=$('.slide:eq('+index+') > table[id^="course"]').find('input[type="checkbox"]:checked');
	var totalChecked=obj.length;
	if(totalChecked==0)
	{
		messagePopup('No section is selected.');
	}
	else
	{
		var html='<div style="padding-bottom:10px;">Choose a method for scheduling selected sections:<br/>';
		html+='<input type="radio" name="choiceday" value="grouped">By Day Group';
		html+='<input type="radio" name="choiceday" value="indiv" checked>Individually</div>';
		html+='<table id="coursSchedTime">';
		html+='<thead><tr><td>Day <font color="#c77f02">*</font></td><td>Start Time <font color="#c77f02">*</font></td><td>End Time <font color="#c77f02">*</font></td></tr></thead><tbody>';

		var optionDays="<option></option>";
		var optionTimes="<option></option>";
		var schedExists=false;
		var numClasses,compDuration;
		var mixedBulk=false;
		if(numColumns==3 || numColumns==5)//Gouped by Component
		{

			numClasses=parseInt(obj.eq(0).closest('tr').find('td:eq(1)').text());
			compDuration=obj.eq(0).closest('table').attr('id');
			compDuration=compDuration.split('_')[1];
		}
		else if(numColumns==4)//Gouped by Groups
		{
			numClasses=parseInt(obj.eq(0).closest('tr').find('td:eq(2)').text());
			var component=obj.eq(0).closest('tr').find('td:eq(1)').attr('id').split('_')[0];
			obj.each(function(){
				var c=$(this).closest('tr').find('td:eq(1)').attr('id').split('_')[0];
				if(c!=component)
				{
					messagePopup('Different component sections cannot be scheduled together.');
					un_markAll(0);
					mixedBulk=true;
					return false;
				}
			});
			if(mixedBulk)
				return;
			else
				compDuration=obj.eq(0).closest('tr').find('td:eq(1)').attr('id').split('_')[1];

		}

		var idSection=obj.eq(0).closest('tr').find('td:eq(0)').attr('id');
		if(totalChecked>1)
		{
			if($('[id^="canvas_'+idSection+'_"]').length!=0)
			{
				$('[id^="canvas_'+idSection+'_"]').each(function() {
					var idCanvas=$( this ).attr('id');
					var day=idCanvas.split('_')[2];
					var sTime=idCanvas.split('_')[3];
					var eTime=idCanvas.split('_')[4];
					obj.each(function(){
						var	sec=$(this).closest('tr').find('td:eq(0)').attr('id');
						if($('[id^="canvas_'+sec+'_'+day+'_'+sTime+'_'+eTime+'"]').length==0)
						{
							mixedBulk=true;
							return false;
						}
					});
				});
			}
		}

		//Check if a schedule already exists
		if($('[id^="canvas_'+idSection+'_"]').length!=0 && !mixedBulk)
		{   //exists
			schedExists=true;
			var arrPrevSchedule=[];
			var day,sTime,eTime;
			$('[id^="canvas_'+idSection+'_"]').each(function() {
				var idCanvas=$( this ).attr('id');
				day=idCanvas.split('_')[2];
				sTime=idCanvas.split('_')[3];
				sTime=sTime.substring(0,2)+':'+sTime.substring(2,4);
				eTime=idCanvas.split('_')[4];
				eTime=eTime.substring(0,2)+':'+eTime.substring(2,4);
				arrPrevSchedule.push([day,sTime,eTime]);

			});

			//Fill generic
			for(var i=0; i<arrTimes.length; i++)
			{
				var temp=arrTimes[i].split(';');
				optionTimes+="<option value='"+temp[1] +"'>"+temp[0] +"</option>";
			} 
			genericOptTimes=optionTimes;


			for(var j=0 ; j<arrPrevSchedule.length; j++)
			{
				optionDays="<option></option>";
				for(var i=0; i<arrDays.length; i++)
				{
					var temp=arrDays[i].split(':');
					if(temp[0].toLowerCase().trim()==arrPrevSchedule[j][0])
					{
						optionDays+="<option value='"+temp[1] +"' selected>"+temp[0] +"</option>";
					}
					else
						optionDays+="<option value='"+temp[1] +"'>"+temp[0] +"</option>";
				}
				html+='<tr><td><select id="listDays'+j+'" onchange="enableBtn();">'+optionDays+'</select></td>';

				optionTimes="<option></option>";
				for(var i=0; i<arrTimes.length; i++)
				{
					var temp=arrTimes[i].split(';');
					if(temp[0]==arrPrevSchedule[j][1])
					{
						optionTimes+="<option value='"+temp[1] +"' selected>"+temp[0] +"</option>";
					}
					else
						optionTimes+="<option value='"+temp[1] +"'>"+temp[0] +"</option>";
				}
				html+='<td><select id="listStartTime'+j+'" onchange="checkTime(this,\''+compDuration+'\')">'+optionTimes+'</select></td>';

				optionTimes="<option></option>";
				for(var i=0; i<arrTimes.length; i++)
				{
					var temp=arrTimes[i].split(';');
					if(temp[0]==arrPrevSchedule[j][2])
					{
						optionTimes+="<option value='"+temp[1] +"' selected>"+temp[0] +"</option>";
					}
					else
						optionTimes+="<option value='"+temp[1] +"'>"+temp[0] +"</option>";
				}
				html+='<td><select id="listEndTime'+j+'" onchange="checkTime(this,\''+compDuration+'\')" disabled>'+optionTimes+'</select></td></tr>';
			}

		}
		else
		{
			for(var i=0; i<arrDays.length; i++)
			{
				var temp=arrDays[i].split(':');		 
				optionDays+="<option value='"+temp[1] +"'>"+temp[0] +"</option>";
			}
			for(var i=0; i<arrTimes.length; i++)
			{
				var temp=arrTimes[i].split(';');
				optionTimes+="<option value='"+temp[1] +"'>"+temp[0] +"</option>";
			}
			for(var i=0; i<numClasses; i++)
			{
				html+='<tr><td><select id="listDays'+i+'">'+optionDays+'</select></td>';
				html+='<td><select id="listStartTime'+i+'" onchange="checkTime(this,\''+compDuration+'\')">'+optionTimes+'</select></td>';
				html+='<td><select id="listEndTime'+i+'" onchange="checkTime(this,\''+compDuration+'\')" disabled>'+optionTimes+'</select></td></tr>';
			}

			genericOptTimes=optionTimes;
		}






		html+='</tbody></table>';
		html+='<br/><div id="spinner" style="visibility:hidden;">Loading <img src="'+$("#custpage_img_ajaxloader").val()+'" alt="Loading"/></div>';

		if(schedExists)
			html+='<input id="savePopup" class="btnAP" type="button" onClick="saveCrseSchedTime(\'' + index + '\',\''+numColumns+'\');" value="Save" disabled></input>';
		else
			html+='<input id="savePopup" class="btnAP" type="button" onClick="saveCrseSchedTime(\'' + index + '\',\''+numColumns+'\');" value="Save"></input>';

		html+='<input id="btnCancel" class="btnAP" type="button" onClick="closeBox();" value="Cancel" ></input>';
		var options = {
				width:500,
				content: html,
				title:Title,
				ignoreDelay: true,
				closeButton:false,
				draggable:'title',
				blockScroll:false,
				closeOnClick:false,
				onCloseComplete: function() 
				{ 
					this.destroy();
				}
		};

		var M=new jBox('Modal',options);
		M.open();
		if(numClasses==1)
			$("input[type=radio][name=choiceday]").eq(0).attr('disabled',true);
		$('.jBox-Modal .jBox-title').css('background-color', colorBg);
		numClassesPerWeek=0;
	}
}

/**STEP3: CLOSES ALERT POPUPS AND UNCHECK SELECTED SECTIONS**/
function closeBox()
{
	$('div[id^="jBox"]').remove();
	un_markAll(0);
}

/**GENERIC: A GENERIC FUNCTION TO RETURN THE HEX COLOR FROM THE RGB COLOR GIVEN AS INPUT PARAM**/
function rgbToHex(rgb) {
	var parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	delete(parts[0]);
	for (var i = 1; i <= 3; ++i) {
		parts[i] = parseInt(parts[i]).toString(16);
		if (parts[i].length == 1) parts[i] = '0' + parts[i];
	}
	var c = '#' + parts.join('');
	return c;
}

/**STEP4: SAVE ALL DATA TO BE SENT TO SUITELET**/
function getTableFacClass()
{
	var arrfacClass=[];
	var noBookedSlctd=true;
	$('table[id^="facClass"] > tbody >tr').each(function(){
		var idSec=$( this ).find('td:eq(0)').attr('id');
		if(idSec.indexOf('remove')<0)
		{
			//change over here
			var idFac=$( this ).find('td:eq(2)').find('select').val();
			var idBld=$( this ).find('td:eq(3)').find('select').val();
			var idRoom=$( this ).find('td:eq(5)').find('select option:selected').attr('id');
			arrfacClass.push(base64_encode(idSec)+':'+base64_encode(idFac)+':'+base64_encode(idBld)+':'+base64_encode(idRoom));

			if($( this ).find('td:eq(5)').find('select option:selected').attr('class')=='Booked')
			{
				messagePopup($( this ).find('td:eq(5)').find('select option:selected').text()+' is already booked.');
				noBookedSlctd=false;
				return false;
			}
			//change over here
			if($( this ).find('td:eq(2)').find('select option:selected').attr('class')=='Booked')
			{
				messagePopup($( this ).find('td:eq(2)').find('select option:selected').text()+' is already booked.');
				noBookedSlctd=false;
				return false;
			}

			//if update made in prev step
			if(nlapiGetFieldValue('custpage_update_sched')==null && !$(this).find('td:eq(1)').find('input[type="checkbox"]').is(':checked') && !isEmpty(idFac))
			{
				messagePopup('There were changes done in section timings hence some faculty may no longer be available.\nTo check faculty availability, select the "Show Available Faculty" box.');
				noBookedSlctd=false;
				return false;
			}

		}
	});
	if(noBookedSlctd)
		return arrfacClass;
	else
		return null;
}

/**FACULTIES: UPON CLICKING ON SAVE GET ALL DATA AND SAVE THE FACULTIES & CLASSROOMS AS DRAFT AND GO CS HOMEPAGE**/
function onSaveFacClass(year , course , term)
{
	var arrfacClass=getTableFacClass();

	if(arrfacClass!=null)
	{

		var url=getNetsuiteURL();
		url  =nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
		url+='&action=savefacclass&year='+ base64_encode(year) +'&course='+ base64_encode(course) +'&term='+base64_encode(term);
		url+='&arr='+arrfacClass;
		url+='&compid='+nlapiGetContext().getCompany();
		window.ischanged = false;  
		window.open(url,'_self');
	}

}

/**STEP2&3: BACK FROM STEP3 TO STEP2 UPON CLICKING ON BACK BUTTON**/
function onBack()
{
	if(method=='scratch')
	{
		$("#listTerms").prop('disabled', false);
		$("#autocomplete").prop('disabled', false);
		$("#listAcadYr").prop('disabled',false);
		$(".btnAP:eq(0)").attr('disabled',true);
		$(".btnAP:eq(1)").attr('disabled',true);
		$(".btnAP:eq(3)").css("visibility", "hidden");
		$(".btnAP:eq(4)").attr('disabled',false);
		$(".btnAP:eq(5)").attr('disabled',false);
		$('input[type="radio"][name="method"]').attr('disabled',false);
	}
	else if(method=='historical')
	{
		$(".btnAP:eq(0)").attr('disabled',true);
		$(".btnAP:eq(1)").attr('disabled',true);
		$("#listTermsH").prop('disabled',false);
		$("#listAcadYrH").prop('disabled', false);
		$("#listTermsP").prop('disabled', false);
		$("#autocompleteH").prop('disabled', false);
		$("#listAcadYrP").prop('disabled', false);
		$("#summaryDiv").empty();
		$(".btnAP:eq(4)").attr('disabled',false);
		$(".btnAP:eq(5)").attr('disabled',false);
		$('input[type="radio"][name="method"]').attr('disabled',false);
	}
	hideSchedule();
}

/**NAVIGATION BUTTON: BACK BUTTON FOR ALL PAGES , AND THE TWO SCHEDULING METHODS**/
function goBack()
{
	var year=arguments[0] ;
	var course =arguments[1] ; 
	var term=arguments[2] ;
	var url=getNetsuiteURL();
	url  =nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
	if(arguments.length==3)
		url+='&action=goback&year='+ base64_encode(year) +'&course='+ base64_encode(course) +'&term='+base64_encode(term);
	else
	{
		var method=arguments[3]; 
		var mode=base64_encode('nextwithoutsv');
		if(method=='scratch')
			url+='&action=saving&mode='+mode+'&method='+base64_encode(method)+'&year='+ base64_encode(year) +'&course='+ base64_encode(course) +'&term='+base64_encode(term);
		else
			url+='&action=saving&mode='+mode+'&method='+base64_encode(method)+'&yearP='+ base64_encode(year.split(':')[0] )+'&course='+ base64_encode(course) +'&termP='+base64_encode(term.split(':')[0])+'&termH='+base64_encode(term.split(':')[1])+'&yearH='+base64_encode(year.split(':')[1]);
	}
	url+='&compid='+nlapiGetContext().getCompany();
	window.ischanged = false;  
	window.open(url,'_self');
}

/**NAVIGATION BUTTON: PREVIEW BUTTON TO DISPLAY FINAL RESULT OF THE CS**/
function preview(year,course,term,method)
{
	var arrfacClass=getTableFacClass();
	if(arrfacClass!=null)
	{
		var url=getNetsuiteURL();
		url =nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
		url+='&action=preview&year='+ base64_encode(year) +'&course='+ base64_encode(course) +'&term='+base64_encode(term)+'&method='+base64_encode(method);
		url+='&arr='+arrfacClass;
		url+='&compid='+nlapiGetContext().getCompany();
		window.ischanged = false;  
		window.open(url,'_self');
	}

}

/**NAVIGATION BUTTON: SUBMIT BUTTON IN FINAL PAGE TO SET STATUS OF CSCHEDULES CREATED TO DEFAULT STATUS IN SETUP**/
function onSubmit()
{
	var url=getNetsuiteURL();
	url =nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
	if(arguments.length==3)
	{
		var year=arguments[0];
		var course=arguments[1];
		var term=arguments[2];
		url+='&action=submit&year='+ base64_encode(year) +'&course='+ base64_encode(course) +'&term='+base64_encode(term);
	}
	else
	{
		url+='&header='+base64_encode('Course schedule successfully Saved as Draft');
	}
	url+='&compid='+nlapiGetContext().getCompany();
	window.ischanged = false;  
	window.open(url,'_self');
}

/**STEP2&4: RESET PREV DATA**/
function onReset(step)
{
	if(step=='2')
	{
		if(method=='scratch')
		{
			$("#listTerms").val(prevTrm);
			$("#autocomplete").val(prevCrse);
			$("#listAcadYr").val(prevYr);
			if(!isEmpty(prevYr))
			{
				if(!isEmpty(prevCrseId))
				{
					getPrograms(prevCrseId);
					callCommonAjax('&action=getDescription&item='+parseInt(prevCrseId),function(res){
						if(res)
							$("#descFld").text(res);
					});
				}
			}
			else
			{
				$("#descFld").text('');
				$("#listPrograms").val('');
			} 
		}
		else 
		{
			$("#listTermsP").val(prevTrm);
			$("#listTermsH").val(prevTrmH);
			$("#autocompleteH").val(prevCrse);
			$("#listAcadYrP").val(prevYr);
			$("#listAcadYrH").val(prevYrH);
			if(!isEmpty(prevYr))
			{
				if(!isEmpty(prevCrseId))
				{
					getPrograms(prevCrseId);
					callCommonAjax('&action=getDescription&item='+parseInt(prevCrseId),function(res){
						if(res)
							$("#descFldH").text(res);
					});
				}
			}
			else
			{
				$("#descFldH").text('');
				$("#listProgramsH").val('');
			} 
		}
	}
	else if(step=='4')
	{
		$('#slideshow').html('');
		$('#slideshow').hide();
		$('#spinner').css('display','block');
		var url=nlapiGetFieldValue('custpage_facclass_url');
		url=url.replace(/saving/g,"facclass_display");
		ajaxCaller(url,'reset',function(data){
		});

	}

}

/**STEP3&4: CLEARS DATA**/
function onClear(step)
{
	if(step=='3')
	{
		if($('[id^="canvas_"]').length!=0)
		{
			$('[id^="canvas_"]').remove();
		}
	}
	else if(step=='4')
	{
		//init bldngs , rmtypes and rms
		$('table[id^="facClass"] > tbody > tr').find('select[id^="listFac_"]').html(optionsFaculties);
		$('table[id^="facClass"] > tbody > tr').find('select[id^="listRmType_"]').html(optionsRmTypes);
		$('table[id^="facClass"] > tbody > tr').find('select[id^="listRm_"]').html(optionsRooms);

		$('[id^="facClass"]').find('select').val('--TBD--');
		$('[id^="facClass"]').find('input[type="checkbox"]').attr('checked',false);
		$('table[id^="facClass"] > tbody > tr').find('td:eq(6)').text('');
		$('table[id^="facClass"] > tbody > tr').find('td:eq(7)').text('');
	}
}

/**GENERIC: NS DOMAIN**/
function getNetsuiteURL()
{
	var linkUrl;
	switch (nlapiGetContext().getEnvironment()) 
	{
	case "PRODUCTION":
		linkUrl = 'https://system.netsuite.com';
		break;

	case "SANDBOX":
		linkUrl = 'https://system.sandbox.netsuite.com';
		break;

	case "BETA":
		linkUrl = 'https://system.beta.netsuite.com';
		break;
	}

	return linkUrl;
}

/**STEP3: MARK / UNMARK CHECKBOXES IN SECTIONS TABLE**/
function un_markAll(button)
{
	if(button==1)
	{
		var slidesWidth=420;
		var pos=parseInt(Math.abs($('#slidesHolder').css('margin-left').replace('px', '')))/slidesWidth;
		$('.slide:eq('+pos+')').find('table[id^="course"]').find('input[type=checkbox]').prop('checked', true);
	}	
	else if(button==0)
	{
		var slidesWidth=420;
		var pos=parseInt(Math.abs($('#slidesHolder').css('margin-left').replace('px', '')))/slidesWidth;
		$('.slide:eq('+pos+') > table[id^="course"]').find('input[type=checkbox]').prop('checked', false);
	}
}


function openFacAv(obj)
{
	var valFac=$(obj).closest('tr').find('td:eq(2) select').val();
	var html='';
	html+='<table id="coursSchedTime">';
	html+='<thead><tr><td>Days Available</td><td>From</td><td>To</td></thead><tbody>';
	if(!isEmpty(valFac) && valFac!='--TBD--')
	{
		$('body').css( 'cursor', 'wait' );
		var textFac=$(obj).closest('tr').find('td:eq(2) select option:selected').text();
		var param='&action=getAvFac&fac='+valFac;
		callCommonAjax(param, function(result){
			if(result)
			{
				html+=result;
				html+='</tbody></table>';
				var options = {
						width:500,
						height:220,
						content: html,
						title:'Availability of <b>'+textFac+'</b>',
						ignoreDelay: true,
						closeButton:true,
						draggable:'title',
						blockScroll:false,
						onCloseComplete: function() 
						{ 
							this.destroy();
						}
				};

				var M=new jBox('Modal',options);
				M.open();
				$('.jBox-Modal .jBox-title').css('background-color', colorBg);
				$('body').css( 'cursor', 'initial' );
			}
		});
	}
	else
	{
		messagePopup('Please choose an entry first.');
	}

}





/**GENERIC: A GENERIC AJAX CALL ADDING 'ACTION' AS PARAMETERS TO THE URL**/
function ajaxCaller(action,callback)
{
	var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_coursesched', 'customdeploy_softype_ederp_coursesched');
	URL+="&action="+action;
	var count=arguments.length;
	if(arguments.length==3)
		URL=arguments[0];

	$.ajax({
		url: URL
	})
	.complete(function( data ) {
		if(data)
		{
			if(count==3)
			{
				$('#slideshow').html(data.responseText);
				manageSlidesFacClass();
				$('caption').css('background-color', colorBg);

			}
			else
				callback(data.responseText);
		}

	});

}

/**NAVIGATION BUTTON: CANCEL BUTTON TAKES TO CS HOMEPAGE**/
function onCancel()
{
	var resp=confirm('Are you sure you want to leave this page?');
	if(resp)
		if(window.history.back()==undefined)
			window.location.reload();
}

/**GENERIC: A GENERIC AJAX CALL TO COMMON SUITELET**/
function callCommonAjax(parameters, callback)
{
	var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_commonfn', 'customdeploy_softype_ederp_st_commonfn');
	URL+=parameters;
	$.ajax({
		url: URL,
	}).complete(function( data ) {
		if(data)
			callback(data.responseText);
	});
}

/***onchange Field Value function to set firstname and lastname in Faculty display field***/
function CopyFacultyName(type)
{
	var facultyName=nlapiGetFieldText('custrecord_ederp_schedule_faculty');
	facultyName=facultyName.split(' ');
	nlapiSetFieldValue('custrecord_ederp_schedule_faculty_disp', facultyName[1]+' '+facultyName[2], false, true);

}
