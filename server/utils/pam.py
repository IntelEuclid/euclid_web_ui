#!/usr/bin/env python

import PAM


class PamAuthentication():
	def __init__(self, user,password):
		self._user = user;
		self._password = password

	def authenticate(self):
		service = 'passwd'
		auth = PAM.pam()
		auth.start(service)
		auth.set_item(PAM.PAM_USER, self._user)
		auth.set_item(PAM.PAM_CONV, self._pam_conv)

		try:
			auth.authenticate()
			auth.acct_mgmt()
			return True
		except PAM.error, resp:
			return False


	def _pam_conv(self, auth, query_list, userData):

		resp = []

		for i in range(len(query_list)):
			query, type = query_list[i]
			if type == PAM.PAM_PROMPT_ECHO_ON:
				resp.append((self._user,0))
			elif type == PAM.PAM_PROMPT_ECHO_OFF:
				resp.append((self._password,0))
			elif type == PAM.PAM_PROMPT_ERROR_MSG or type == PAM.PAM_PROMPT_TEXT_INFO:
				print query
				resp.append(('', 0))
			else:
				return None
		return resp
