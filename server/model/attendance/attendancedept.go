package attendance

import "server/model/common/request"

type AttendanceDept struct {
	UserName     string              `json:"userName"`
	DeptName     string              `json:"deptName"`
	ClickInTime  request.SliceString `json:"clickInTime"`
	ClickOutTime request.SliceString `json:"clickOutTime"`
}
