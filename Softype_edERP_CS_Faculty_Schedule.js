/* **************************************************************************************  
 ** Copyright (c) 1998-2012 Softype, Inc.                                 
 ** Morvi House, 30 Goa Street, Ballard Estate, Mumbai 400 001, India
 ** All Rights Reserved.                                                    
 **                                                                         
 ** This software is the confidential and proprietary information of          
 ** Softype, Inc. ("Confidential Information"). You shall not               
 ** disclose such Confidential Information and shall use it only in          
 ** accordance with the terms of the license agreement you entered into    
 ** with Softype.                       
 ** @author:  Bhanu Senjaliya
 ** @version: Revised version
 ** Description: 
 ************************************************************************************** */
/**GLOBAL VAR**/
var z=1000;
var CalMainArray = new Array();

/**ON CHANGE EVENT ON FIELD : YEAR, TERM, SCHEDULE BY **/
$('#listAcadYr').on('change',function(){
	if($("#SuccessMsg").length!=0)
		$("#SuccessMsg").delay(0).fadeOut();
});
$('#listAcadTerm').on('change',function(){
	if($("#SuccessMsg").length!=0)
		$("#SuccessMsg").delay(0).fadeOut();
});
/*$('#listScheduleBy').on('change',function(){
	if($("#SuccessMsg").length!=0)
		$("#SuccessMsg").delay(0).fadeOut();
});*/
/** ON READY FUNCTION FOR MSG**/
$().ready(function() {
	captioncolor();
	if($("#SuccessMsg").length!=0)
	{
		var post_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_schldisplay', 'customdeploy_softype_ederp_schldisplay');;
		history.replaceState("object or string", "title", post_url);
	} 
	//Sarah : added instant calendar display if calling from Course Scheduling
	if($('#hidden_faculty').length>0 && $('#listAcadYr').val() && $('#listAcadTerm').val())
		displayCalendar();
});

/**SET COLORS ACCORDING TO USER THEMES**/
function ColorTheme()
{
	var colorBg =''+rgbToHex($('#ns_navigation').css('backgroundColor'));
	$("caption").css("background",colorBg);
	$(".FldGrpHdr").css("color",colorBg);

}

/**TRIGGER ON SELECTION OF "COURSE" FIELD ON SUITELET AND FETCH DATA OF COMPONENT AND SECTION AND COURSE DESCRIPTION**/
function refrestingshother(CourseId)
{
	var course_id = $(CourseId).val();
	var dropdown = $('#listcoursecomp');
	dropdown.empty();
	var CourseSection = $('#listcoursesecn');
	CourseSection.empty();
	if(!isEmpty(course_id))
	{			
		/**CALL AJAX FUNCTION TO DYNAMICALLY COLLECT DATA AS PER COURSE**/
		var MixValue = new Array();
		var CSHtml = callAjax('&action=getSectionComp&courseid='+course_id+'&acdterm='+ $('#listAcadTerm').val()+'&acdyear='+$('#listAcadYr').val()+'&recType=item&fldNames=salesdescription');

		MixValue = CSHtml.split('::!!');

		/**ADD DATA TO FIELDS**/
		$('#coursedesc').text(MixValue[0]);
		dropdown.append(MixValue[1]);
		CourseSection.append(MixValue[2]);		
	}
	else
	{
		/**IF NO COURSE IS SELECTED THEN SET NULL VALUES TO DESCRIPTION, COMPONENT AND SECTION**/
		$('#coursedesc').text('');	
		var Html = '<option value = ""></option>';
		dropdown.append(Html);
		CourseSection.append(Html);
	}
}
/**COMMON AJAX FUNCTION TO FETCH DATA AS PER PERAMETER**/
function callAjax(parameters)
{
	//var URL=nlapiResolveURL('SUITELET', 'customscript_server_side_code', 'customdeploy_server_side_code');
	var URL=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_commonfn', 'customdeploy_softype_ederp_st_commonfn');
	URL+=parameters;
	var result=null;
	$.ajax({
		url: URL,
		async: false
	})
	.done(function( data ) {
		if(data.length != 0 )
		{
			result=data;
		}
	});
	return result;
}
/** TRIGGER ON SELECTION OF COMPONENT FIELD ON SUITELET PAGE AND FETCH COURSE SECTION DATA AS PER COURSE AND COMPONENT**/
function filterSectionperComp(CourseCompID)
{
	var CourseComp_id = $(CourseCompID).val();
	var CS_Component;
	var CourseSection = $('#listcoursesecn');
	CourseSection.empty();
	/**CALL AJAX FUNCTION TO DYNAMICALLY COLLECT DATA AS PER COURSE AND COURSE COMPONENT**/
	var CSHtml = callAjax('&action=getSection&courseid='+  $('#listbycourse').val()+'&acdterm='+ $('#listAcadTerm').val()+'&acdyear='+$('#listAcadYr').val() +'&recId='+CourseComp_id+'&recType=customrecord_ederp_coursecomp&fldNames=custrecord_ederp_coursecomp_name');
	CourseSection.append(CSHtml);	

}

/** TRIGGER ON SELECTION OF BUILDING FIELD ON SUITELET PAGE AND FETCH ROOM DATA **/
function filterclassroom(BuildId)
{
	var BuildingId = $(BuildId).val();
	var FSClassRoom = $('#listclassroom');
	FSClassRoom.empty();	
	var Html = callAjax('&action=getClassroom&buildingid='+BuildingId);	
	FSClassRoom.append(Html);
}

/** TRIGGER ON SELECTION OF PROGRAM FIELD ON SUITELET PAGE AND FETCH BATCH AND PROGRAM YEAR DATA **/
function filterStudentBatch(ProgmId)
{
	var ProgramId = $(ProgmId).val();

	var ProgramBatch = $('#liststdbatch');
	ProgramBatch.empty();
	var ProgramYear =  $('#listprogyear');
	ProgramYear.empty();

	var ProgramAcdTearm  =  $('#listAcadTerm').val();

	if(ProgramId != null && ProgramId != '')
	{
		/**CALL AJAX FUNCTION TO DYNAMICALLY COLLECT DATA OF BATCH AND PROGRAM YEAR AS PER PROGRAM ID **/
		var BatchYearValue = 	callAjax('&action=stdBatch&programid='+ProgramId+'&programterm='+ProgramAcdTearm);	
		var MixValue = new Array();
		MixValue = BatchYearValue.split('::!!');	
		ProgramBatch.append(MixValue[0]);
		ProgramYear.append(MixValue[1]);
	}
	else
	{
		/**IF NO PROGRAM YEAR IS SELECTED THEN COLLECT DATA OF BATCH AND PROGRAM YEAR**/
		var Html = 	callAjax('&action=nullprogram');	
		var MixValue = new Array();
		MixValue = Html.split('::!!');		
		ProgramBatch.append(MixValue[0]);
		ProgramYear.append(MixValue[1]);
	}
}

/**REMOVE THE DUPLICATE VALUES**/
function removeDuplicate(arrayName)
{
	var newArray=new Array();
	label:for(var i=0; i<arrayName.length;i++ )
	{  
		for(var j=0; j<newArray.length;j++ )
		{
			if(newArray[j][0]==arrayName[i][0]) 
				continue label;
		}
		newArray[newArray.length] = arrayName[i];
	}
	return newArray;
} 

/** TRIGGER ON SELECTION OF PROGRAM YEAR FIELD ON SUITELET PAGE AND FETCH BATCH DATA **/
function filterBatchByYear(YearId)
{
	var ProgBatchYear = $('#liststdbatch');
	ProgBatchYear.empty();	
	var batchHtml = 	callAjax('&action=batchByYear&batchyearid='+$(YearId).val() +'&prgmid='+$('#listbyProgm').val());	
	ProgBatchYear.append(batchHtml);
}

/**TRIGGER ON CLICK OF "DISPLAY" BUTTON **/
function displayCalendar()
{
	if($('[id^="canvas_"]').length!=0)
	{
		$('[id^="canvas_"]').remove();
	}
	/**GET THE CURENT VALUE PROVIDED BY USER**/
	var CC_AcdYear  = $('#listAcadYr').val();
	//alert('user_AcdYear'+CC_AcdYear);
	var CC_AcdTerm  = $('#listAcadTerm').val();
	//alert('user_AcdTerm'+CC_AcdTerm);
	//var CC_ScheduleBy  = $('#listScheduleBy').val();
	//alert('user_ScheduleBy :'+CC_ScheduleBy);
	var post_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_facsched', 'customdeploy_ederp_facultyschedule_deplo');
	post_url += '&cc_acdyear='+base64_encode(CC_AcdYear);
	post_url += '&cc_acdterm='+base64_encode(CC_AcdTerm);
/*	post_url += '&cc_schlby='+base64_encode(CC_ScheduleBy);
	switch (CC_ScheduleBy)
	{
		case 'course':
			var CC_CourseId = $('#listbycourse').val();
			//alert('CC_CourseId :'+CC_CourseId);
			if(isEmpty(CC_CourseId))
			{
				//confirm('Please select course.');	
				var DisplayMsg = 'Please select course.';
				var popup = '<table><tr><td>'+DisplayMsg+'</td></tr>';
				popup +='<tr><td><input class="btnAP" id="btnModalY" type="button" onClick="closepopup();" value="OK"></input></td></tr>';
				popup += '</table>'; 
				custompopup(popup);
				return false	;			
			}
			var CC_CourseComp = $('#listcoursecomp').val();
			//alert('CC_CourseComp :'+CC_CourseComp);
			var CC_CourseSect = $('#listcoursesecn').val();	
			//alert('CC_CourseSect :'+CC_CourseSect);
			post_url += '&cc_courseid='+base64_encode(CC_CourseId);
			post_url += '&cc_courcomp='+base64_encode(CC_CourseComp);
			post_url += '&cc_coursect='+base64_encode(CC_CourseSect);
			break;
		case 'faculty':*/
			var CC_Faculty = nlapiGetContext().getUser();
			if($('#hidden_faculty').length>0)
				CC_Faculty = $('#hidden_faculty').val();
			//alert('faculty name : '+CC_Faculty);
			post_url += '&cc_faculty='+base64_encode(CC_Faculty);
			
		/*case 'classroom':
			var CC_Building = $('#listbybuilding').val();
			if(isEmpty(CC_Building))
			{
				//confirm('Please select Building.');
				var DisplayMsg = 'Please select Building.';
				var popup = '<table><tr><td>'+DisplayMsg+'</td></tr>';
				popup +='<tr><td><input class="btnAP" id="btnModalY" type="button" onClick="closepopup();" value="OK"></input></td></tr>';
				popup += '</table>'; 
				custompopup(popup);
				return false	;				
			}
			var CC_Classroom = $('#listclassroom').val();
			if(isEmpty(CC_Classroom))
			{
				//confirm('Please select Classroom.');
				var DisplayMsg = 'Please select Classroom.';
				var popup = '<table><tr><td>'+DisplayMsg+'</td></tr>';
				popup +='<tr><td><input class="btnAP" id="btnModalY" type="button" onClick="closepopup();" value="OK"></input></td></tr>';
				popup += '</table>'; 
				custompopup(popup);
				return false	;				
			}			
			post_url += '&cc_buil='+base64_encode(CC_Building);
			post_url += '&cc_clsroom='+base64_encode(CC_Classroom);
			break;
		case 'batch':					
			var CC_Progrm = $('#listbyProgm').val();
			var CC_Batch = $('#liststdbatch').val();
			if(isEmpty(CC_Batch))
			{
				//confirm('Please select Batch.');
				var DisplayMsg = 'Please select Batch.';
				var popup = '<table><tr><td>'+DisplayMsg+'</td></tr>';
				popup +='<tr><td><input class="btnAP" id="btnModalY" type="button" onClick="closepopup();" value="OK"></input></td></tr>';
				popup += '</table>'; 
				custompopup(popup);
				return false	;				
			}
			var CC_ProgmYear = $('#listprogyear').val();
			post_url += '&cc_progrm='+base64_encode(CC_Progrm);
			post_url += '&cc_batch='+base64_encode(CC_Batch);
			post_url += '&cc_prgmyear='+base64_encode(CC_ProgmYear);
			//	alert('BatchId = '+CC_Batch);
			break;
		default:
			return;		
	}*/
	post_url += '&action='+ base64_encode( 'dispaly_calndr');
	//alert(post_url);
	var set_div = 'displaycalndr';//create div

	/**CALL FUNCTION TO CREATE CALENDAR**/
	displayCalendarToUser(post_url,set_div);
	ColorTheme();
}

/**COLLECT THE DATA FOR CALENDAR DISPLAY**/
function displayCalendarToUser(post_url,set_div)
{
	/**DISPLAY IMAGE WHILE COOLECTING THE DATA FROM SUITELET**/
	if (!isEmpty(set_div)) {
		$( "#"+set_div).empty();
		//Sarah : added src url from suitelet
		var load_image = '<div align = "center"><img id="img-spinner" src="'+$('#custpage_img_ajaxloader').val()+'" alt="Loading";"/><div>';
		$("#"+set_div).append(load_image);
		$('#img-spinner').css('display','initial');
	}
	$.ajax({url: post_url,async: true}).done(function( data ) 
			{
		if(data.length != 0 )
		{

			var timeOut=100;
			setTimeout(function () 
					{ 
				/**ADD COLOR THEME**/
				ColorTheme();
				//captioncolor();

				if(data.indexOf('!!??')>=0)
				{

					var arrToAddCalendar=data.toString().split('!!??')[1].split(',');
					CalMainArray= [];
					CalMainArray.push( arrToAddCalendar);
					var temp=[];
					var current_sec=arrToAddCalendar[0].split(';')[0];
					var current_idSec=arrToAddCalendar[0].split(';')[1];					
					var current_facName = [];
					var current_Room = [];

					for(var arr=0; arr<arrToAddCalendar.length; arr++)
					{

						var line = arrToAddCalendar[arr].split(';');
						if(current_idSec!=line[1])
						{
							addToCalendar(current_sec,current_idSec,temp,current_facName,current_Room);
							temp=[];
							current_facName=[];
							current_Room=[];
							current_sec=line[0];
							current_idSec=line[1];
						}
						temp.push([line[2],line[3],line[4]]);
						current_facName.push(line[5]);
						current_Room.push(line[6]);						
					}
				}
					},timeOut);

			// Means we have an array at the end
			var MainCal = $('#displaycalndr');
			$('#img-spinner').css("visibility", "block");
			MainCal.empty();		
			if(data.indexOf('!!??')>=0)
				MainCal.append(data.split('!!??')[0]);
			else
				MainCal.append(data);
		}
			});
}

function rand(min, max) {
	return parseInt(Math.random() * (max-min+1), 10) + min;
}

/**CALENDAR: GENERATES RANDOM COLORS**/
function rainbow() {
	var h = rand(1, 360); // color hue between 1 and 360
	var s = rand(30, 100); // saturation 30-100%
	var l = rand(30, 70); // lightness 30-70%
	return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

/**CALENDAR: ADD SECTIONS FACULTY NAME AND ROOMS  TO CALENDAR**/
function addToCalendar(section,idsection,arrCSTime,current_facName,current_Room)
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
		$("#shcalendar tr td.days").each(function () {
			var day=$(this).text().toLowerCase().trim();
			if(day == arrCSTime[i][0].toLowerCase())
			{
				var startTime=""+arrCSTime[i][1];
				var endTime=""+arrCSTime[i][2];
				var idName="_"+day+"_"+arrCSTime[i][1].split(':')[0]+arrCSTime[i][1].split(':')[1]+"_"+arrCSTime[i][2].split(':')[0]+arrCSTime[i][2].split(':')[1];
				var index;
				$("#shcalendar tr td.timings").each(function () {

					var time=startTime.split(':')[0]+":00";
					if($(this).text().trim()==time)
						index=$(this).parent().index();				 
				});
				var startingMin=parseInt(startTime.split(':')[1]);
				startTime = new Date(0, 0, 0, startTime.split(':')[0], startTime.split(':')[1], 0, 0);
				endTime = new Date(0, 0, 0, endTime.split(':')[0], endTime.split(':')[1], 0, 0);
				var diff = endTime - startTime;

				var diffSeconds = diff/1000;
				//var HH = Math.floor(diffSeconds/3600);
				var MM = Math.floor(diffSeconds%3600)/60;
				//var formatted = ((HH < 10)?("0" + HH):HH) + ":" + ((MM < 10)?("0" + MM):MM)
				var coeffH=diffSeconds/3600;
				var coeffT=0.5;


				if(startingMin==30)
					coeffT=1;
				if(startingMin==15)
					coeffT=0.75;
				if(startingMin==45)
					coeffT=1.25;	


				var c=$("#shcalendar").find("tbody > tr:nth-child("+(index+1)+") >td:nth-child("+($(this).index()+1)+")");
				var d=document.createElement("canvas");
				d.width = c.innerWidth()+2;
				d.height = c.innerHeight()*coeffH +2;
				d.id="canvas_"+idsection+idName;
				d.style.left = (c.offset().left)+"px";
				d.style.top = (c.offset().top + coeffT*c.innerHeight() - 1)+"px";
				d.style.position = "absolute";
//				d.addEventListener('click', function() { 
//				$('[id^="canvas_'+idsection+'_"]').css('z-index',z++);
//				}, false);
				d.addEventListener("dblclick", function()
						{
					ShowAllSection(day);
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
				{
					ctx.fillText(txtLines[j-1], 2, (j-1)*14);
					if(current_facName[i] == null ||current_facName[i]== '')
					{
						if(current_Room[i] != null && current_Room[i] != '')
							ctx.fillText(current_Room[i], 2, (j)*14);
					}
					else
					{
						ctx.fillText(current_facName[i], 2, (j)*14);
						if(current_Room[i] != null && current_Room[i] != '')
							ctx.fillText(current_Room[i], 2,(j+1)*14);
					}
				}
				if(section.indexOf('/')>=0)
				{
					ctx.fillText(section.split('/')[1], 2, (j-1)*14);
					ctx.fillText(section.split('/')[2], 2, (j-1)*14*2);

					if(current_facName[i] != null && current_facName[i]!= '')
						ctx.fillText(current_facName[i], 2, (j)*14);
					if(current_facName[i] == null ||current_facName[i]== '')
					{
						if(current_Room[i] != null && current_Room[i] != '')
							ctx.fillText(current_Room[i], 2, (j)*14);	
					}
					else
					{
						if(current_Room[i] != null && current_Room[i] != '')
							ctx.fillText(current_Room[i], 2, (j+1)*14);	
					}			
				}			

				d.style.background = color;

			}
		});

	}
	$('td[id="'+idsection+'"]').closest('tr').css('background-color','#fefeee');
}

/**CALENDAR: DISPLAYS DETAILS OF WHOLE DAY UPON CLICKING ON CANVAS**/
function ShowAllSection(AllDays)
{
	/**COLLECT THE DATA FROM ARRAY**/
	var SplitArray = CalMainArray[0];
	var CollectData = new Array();

	try 
	{

		for(var arr = 0; arr<SplitArray.length; arr++)
		{

			var LineDay = SplitArray[arr].split(';')[2].toString().toLowerCase();
			if(AllDays.toString()  == LineDay.toString())
			{
				CollectData.push(SplitArray[arr]);				
			}	
		}
	}
	catch(e)
	{
	}
	CollectData.sort(function(a, b)
			{					
		if(a.split(';')[3]== b.split(';')[3])
		{
			var x = a.split(';')[4], y =  b.split(';')[4];
			return x == y ? 0 : (x < y ? -1 : 1);
		}
		return (a.split(';')[3] < b.split(';')[3]) ? -1 : 1;					
			});
	var DisplayByVal =  CollectData[0].split(';')[7];
	var 	htmlBody ='<table id="SchedbyDay"  width="650px" style="border:1px; margin-left:auto;margin-right:auto;">';
	if(DisplayByVal == 'course'	 || DisplayByVal == 'batch'	 )
		htmlBody+='<thead><tr><td>Start Time</td><td>End Time</td><td>Course Section</td><td>Faculty</td><td>Room </td></tr></thead><tbody>';
	if(DisplayByVal == 'faculty'	)
		htmlBody+='<thead><tr><td>Start Time</td><td>End Time</td><td>Course Section</td><td>Room </td></tr></thead><tbody>';
	if(DisplayByVal == 'classroom'	 )
		htmlBody+='<thead><tr><td>Start Time</td><td>End Time</td><td>Course Section</td><td>Faculty</td></tr></thead><tbody>';
	for(var act = 0; act < CollectData.length; act++)
	{
		var SectionName = CollectData[act].split(';')[0];		
		var SectionId = CollectData[act].split(';')[1];
		var StartTime = CollectData[act].split(';')[3];
		var EndTime = CollectData[act].split(';')[4];
		var FacultyName = CollectData[act].split(';')[5];
		var RoomName = CollectData[act].split(';')[6];
		//alert('FacultyName'+FacultyName);
		if(DisplayByVal == 'course'	 || DisplayByVal == 'batch'	 )
		{
			htmlBody += '<tr>';					
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+StartTime.trim() +'" >'+StartTime+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+EndTime.trim() +'" >'+EndTime+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+SectionName.trim() +'" >'+SectionName+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+FacultyName.trim() +'" >'+FacultyName+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "roomname"  value="'+RoomName.trim() +'" >'+RoomName+'</span></td>';
			htmlBody+= '</tr>';
		}
		if(DisplayByVal == 'faculty'	)
		{
			htmlBody += '<tr>';					
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+StartTime.trim() +'" >'+StartTime+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+EndTime.trim() +'" >'+EndTime+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+SectionName.trim() +'" >'+SectionName+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+FacultyName.trim() +'" >'+FacultyName+'</span></td>';
			htmlBody+= '</tr>';
		}
		if(DisplayByVal == 'classroom'	)
		{
			htmlBody += '<tr>';					
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+StartTime.trim() +'" >'+StartTime+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+EndTime.trim() +'" >'+EndTime+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+SectionName.trim() +'" >'+SectionName+'</span></td>';
			htmlBody+='<td><span  class="depSubsFld" contenteditable="false" style="font-size:13px" id = "secname"  value="'+FacultyName.trim() +'" >'+FacultyName+'</span></td>';
			htmlBody+= '</tr>';
		}
	}
	htmlBody += '</table>'; 	
	//htmlBody+='</body></html>';
	var FullDay = GetActualDay(AllDays);
	//alert('FullDay'+FullDay);
	var options = {
			width:800,
			content: htmlBody,
			title: FullDay +' Schedule ' ,
			ignoreDelay: true,
			closeButton:true,
			blockScroll:false,
			onCloseComplete: function() 
			{ 
				this.destroy();
			}
	};
	var M=new jBox('Modal',options);
	M.open();
	captioncolor();	
}

/**GET FULL DAYS FROM SHORT DAYS**/
function GetActualDay(dayParam)
{
	var day = '';
	switch (dayParam)
	{
		case 'mon' :
			return 'Monday';
			break;
		case  'tue' :
			return 'Tuesday';
			break;
		case  'wed' :
			return 'Wednesday';
			break;
		case  'thu' :
			return 'Thursday';
			break;
		case  'fri' :
			return 'Friday';
			break;
		case  'sat' :
			return 'Saturday';
			break;

	}
}
/**CALENDAR: CALCULATE WIDTH OF TEXT DISPLAYED IN CANVAS**/
function getLines(ctx, text, maxWidth)
{
	var words = text.split("-");
	var lines = [];
	var currentLine = words[0];
	for (var i = 1; i < words.length; i++) 
	{
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


/**RUN ON CLICK OF CANCEL BUTTON**/
function onCancel()
{
	window.history.back();
}

/**CLOSE THE POP UP WINDOW**/
function closepopup(){
	setTimeout(function () { $('div[id^="jBox"]').remove();
	$('#spinner').css("visibility", "hidden");},100);
}

/** OPEN JBOX WINDOW **/
function custompopup(html)
{
	var options = {
			width:500,
			height:100,
			content: html,
			title:'Notification',
			ignoreDelay: true,
			closeButton:false,
			blockScroll:false,
			onClose: function() 
			{ 
				return true;
			}
	};
	var M=new jBox('Modal',options);
	M.open();
	captioncolor();
}

/**CAPTION COLOR**/
function captioncolor() {
	var colorBg =''+rgbToHex($('#ns_navigation').css('backgroundColor'));
	$("caption").css("background",colorBg);
	$(".FldGrpHdr").css("color",colorBg);
	$(".jBox-Modal .jBox-title").css("background",colorBg);
}

/**TRIGGER ON CLICK OF "NEXT" BUTTON**/
function DisplayScheduleBy()
{
	// GET THE CURENT VALUE PROVIDED BY USER
	var user_AcdYear  = $('#listAcadYr').val();
	//alert('user_AcdYear'+user_AcdYear);
	var user_AcdTerm  = $('#listAcadTerm').val();
	//var user_ScheduleBy  = $('#listScheduleBy').val();	
	if((isEmpty(user_AcdYear) || isEmpty(user_AcdTerm)))
	{
		var DisplayMsg = 'Please select an item for all mandatory fields';
		var popup = '<table><tr><td>'+DisplayMsg+'</td></tr>';
		popup +='<tr><td><input class="btnAP" id="btnModalY" type="button" onClick="closepopup();" value="OK"></input></td></tr>';
		popup += '</table>'; 
		custompopup(popup);
		//confirm('Please select an item for all mandatory fields.');
	}
	else
	{
		var post_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_facsched', 'customdeploy_ederp_facultyschedule_deplo');
		//var post_url = "/app/site/hosting/scriptlet.nl?script=17&deploy=1";
		post_url += '&userterm='+base64_encode(user_AcdTerm);
		post_url += '&useryear='+base64_encode(user_AcdYear);
		//post_url += '&userschlby='+base64_encode(user_ScheduleBy);
		post_url += '&action='+base64_encode('create_schedule');
		//alert('post_url'+post_url);
		var set_div = 'displayby';//create div
		processData(post_url,set_div);
		ColorTheme();
	
/**ENABLE DISABLE BUTTONS AND FIELDS**/
		$(".btnAP:eq(0)").prop('disabled', true);
		$(".btnAP:eq(1)").prop('disabled', false);

		$(".button_example:eq(0)").prop('disabled', false);
		$(".button_example:eq(1)").prop('disabled', true);
		$(".button_example:eq(2)").prop('disabled', false);
		$(".button_example:eq(3)").prop('disabled', false);


		$("#listAcadYr").prop('disabled', true);
		$("#listAcadTerm").prop('disabled', true);
		$("#listScheduleBy").prop('disabled', true);
	}
}

/**CALL TO AJAX FUNCTION **/
function processData(post_url,set_div,AppMsg)
{	
	if (!isEmpty(set_div)) {
		$( "#"+set_div).empty();
		var load_image = '<div align = "center"><img id="img-spinner" src="/core/media/media.nl?id=609&c=TSTDRV1234890&h=a3b7b0dcfe9a52c38abb" alt="Loading";"/><div>';
		$("#"+set_div).append(load_image);
		$('#img-spinner').css('display','initial');
	}

	$.ajax({url: post_url,async: false}).done(function( data ) 
			{
		if(data.length != 0 )
		{
			var data_arr = data.split(',');

			if (!isEmpty(set_div)) 
			{
				$( "#"+set_div).empty();
				$("#"+set_div).append(data_arr[0]);
			}
			else
			{
				onReset(AppMsg);
			}
		}
			});
}

/**TRIGGER WHEN USER CLICK ON BACK BUTTON**/
function onBack()
{
	$('#displayby').empty();	
	if($('[id^="canvas_"]').length!=0)
	{
		$('[id^="canvas_"]').remove();
	}
	$('#displaycalndr').empty();
	$(".btnAP:eq(0)").prop('disabled', false);
	$(".button_example:eq(1)").prop('disabled', false);

	$("#listAcadYr").prop('disabled', false);
	$("#listAcadTerm").prop('disabled', false);
	$("#listScheduleBy").prop('disabled', false);

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

/**CALL TO SUITELET WITH PARAMETER**/
function onReset(msg)
{
	var url=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_facsched', 'customdeploy_ederp_facultyschedule_deplo');
	if (!isEmpty(msg))
	{
		url += '&msg='+base64_encode(msg);
	}
	window.ischanged = false;  
	window.open(url,'_self');
}