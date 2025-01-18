package initialize

import (
	"encoding/json"
	"github.com/go-redis/redis"
	"github.com/golang-module/carbon/v2"
	"server/global"
	"server/model/attendance"
	"server/model/system"
	"time"
)

func InitRedis() *redis.Client {
	r := redis.NewClient(&redis.Options{
		Addr:     "47.120.68.50:6059",
		Password: "redisPWD",
		DB:       10,
	})
	var userList []system.SysUser
	global.GVA_DB.Find(&userList)
	var dept system.SysDept
	for _, user := range userList {
		//进行哈希值存储
		global.GVA_DB.Where("id = ?", user.DeptId).First(&dept)
		r.HSet(user.Username, "clickInTime1", dept.ClickInTime[0])
		r.HSet(user.Username, "clickInTime2", dept.ClickInTime[1])
		r.HSet(user.Username, "clickOutTime1", dept.ClickOutTime[0])
		r.HSet(user.Username, "clickOutTime2", dept.ClickOutTime[1])
	}
	var attendanceRecords []attendance.AttendanceRecord
	global.GVA_DB.Where("date >= ? AND  date <= ? ", carbon.Now().SubMonthNoOverflow().ToDateString(), carbon.Now().ToDateString()).Find(&attendanceRecords)
	for _, dateRecord := range attendanceRecords {
		record, _ := json.Marshal(dateRecord)
		r.Set(dateRecord.Date, record, time.Hour)
	}
	return r
}
