/* **************************************************************************************  
 ** Copyright (coffee) 1998-2012 Softype, Inc.                                 
 ** Morvi House, 30 Goa Street, Ballard Estate, Mumbai 400 001, India
 ** All Rights Reserved.                                                    
 **                                                                         
 ** This software is the confidential and proprietary information of Softype, Inc. ("Confidential Information"). 
 ** You shall not disclose such Confidential Information and shall use it only in accordance with the terms of 
 ** the license agreement you entered into with Softype.                       
 ** @author:  Bhanu Senjaliya
 ** @version: 1.0
 ** Description:  This script is used in Mass approval suitelet.
 ************************************************************************************** */

/**THIS FUNCTION IS TRIGGER ON FIELD CHANGE ON  SUITELET**/
function FieldChangeTrigger(type,fld)
{
	/**TRIGGER ONLY ON FIELS : YEAR, COURSE AND TERM**/
	if(fld == 'custpage_acadyear_list' || fld == 'custpage_course_list' ||fld == 'custpage_acadterm_list')
	{
		
		/**GET VALUES FROM FIELDS**/
		var GetYear = nlapiGetFieldValue('custpage_acadyear_list');
		var GetCourse = nlapiGetFieldValue('custpage_course_list');
		var GetTerm = nlapiGetFieldValue('custpage_acadterm_list');
		
		/**CALL THE SUITELE PAGE WITH PARAMETERS**/
		var post_url=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_mssappr_cs', 'customdeploy_softype_ederp_st_mssappr_cs');
		post_url += '&custpage_yearparm='+base64_encode(GetYear);
		post_url += '&custpage_termparm='+base64_encode(GetTerm);	
		post_url += '&custpage_courseparm='+base64_encode(GetCourse);	

		nlapiRequestURL(post_url);
		window.ischanged = false;  
		window.open(post_url,'_self');

	}

}

/**TRIGGER ON CLICK OF RESET BUTTON FROM SUITELET AND CALL SUITELET **/
function onReset()
{
	var success_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_mssappr_cs', 'customdeploy_softype_ederp_st_mssappr_cs');
	window.ischanged = false;  
	window.open(success_url,'_self');

}

/**TRIGGER WHEN USER CLICK ON APPROVE OR REJECT BUTTON**/
function changestatus(status)
{
	var setstatus = '';
	if (status == 'approve') {
		setstatus = 2;
	}else if (status == 'reject') {
		setstatus = 3;
	}
	
	/**GET THE LINE ITEMS VALUES AND CALL SUITELET PAGE FOR APPROVE OR REJCT THE RESPECTIVE RECORD AND SEND EMAIL TO OWNER**/
	var linecount = nlapiGetLineItemCount('custpage_main_sublist');
	var selected_rec_count = 0;
	for(var i = 1; i<= linecount;i++ )
	{
		var user_input = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_list_select', i);
		var hiddencourse = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_list_coursehidden', i);
		if (user_input == 'T')
		{
			selected_rec_count++;
			var temp_url=nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_mssappr_cs', 'customdeploy_softype_ederp_st_mssappr_cs');
//			temp_url += '&custpage_cs_csid='+base64_encode(hiddencourse);
//			temp_url += '&custpage_setstatus='+base64_encode(setstatus);			
			temp_url += '&custpage_cs_csid='+hiddencourse;
			temp_url += '&custpage_setstatus='+setstatus;
			temp_url += '&custpage_action=submitsuitelet';

			nlapiRequestURL(temp_url);	
		}
	}
	/**IF NO RECORD IS SELECTED THEN DISPLAY THIS MSG ELSE CALL SUITELET PAGE**/
	if (selected_rec_count == 0) 
	{
		var msg = 'Please select a course schedule to '+status+'.';
		var msgDisplay = 	confirm(msg);
		if(msgDisplay)
		{

		}
		else
		{
			return false;
		}
		//alert(msg);
	}else
	{
		var success_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_mssappr_cs', 'customdeploy_softype_ederp_st_mssappr_cs');
		success_url += '&msg=success';
		window.ischanged = false;  
		window.open(success_url,'_self');
	}
}
