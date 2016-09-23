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
 ** @author:  AmarG
 ** @version: 1.0
 ** Description:  
 ************************************************************************************** */
var global_url = '';
function page_load(){
	global_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_mass_appr_ap', 'customdeploy_softype_ederp_massappr_ap');	
}

function field_change_filter(type,name) {
	if (name == 'custpage_acadyear_list' || name == 'custpage_program_list')
	{
		var acad_year = nlapiGetFieldValue('custpage_acadyear_list');
		var prog = nlapiGetFieldValue('custpage_program_list');
		var url = global_url;
		url += '&custpage_acad_year_parm='+base64_encode(acad_year);
		url += '&custpage_prog_parm='+base64_encode(prog);
		window.ischanged = false;  
		window.open(url,'_self');
	}
}
function changestatus(status)
{
	var setstatus = '';
	if (status == 'approve') {
		setstatus = 2;
	}else if (status == 'reject') {
		setstatus = 3;
	}
	var linecount = nlapiGetLineItemCount('custpage_main_sublist');
	var selected_rec_count = 0;
	for(var i = 1; i<= linecount;i++ )
	{
		var user_input = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_list_select', i);
		var academicplanto_submit = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_list_acadplan_list_hidden', i);
		if (user_input == 'T')
		{
			selected_rec_count++;
			var temp_url = global_url;
			temp_url += '&custpage_acad_planssubmit_parm='+academicplanto_submit;
			temp_url += '&custpage_setstatus_parm='+setstatus;
			temp_url += '&custpage_action_parm=submitsuitelet';
			nlapiRequestURL(temp_url);	
		}
	}
	if (selected_rec_count == 0) {
		var msg = 'Please select an academic plan to '+status+'.';
		/*custompopup(popup);*/
		alert(msg);
	}else{
		var success_url = global_url + '&msg=success';
		window.ischanged = false;  
		window.open(success_url,'_self');
	}
}
function onReset()
{
	var success_url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_mass_appr_ap', 'customdeploy_softype_ederp_massappr_ap');
	window.ischanged = false;  
	window.open(success_url,'_self');
}