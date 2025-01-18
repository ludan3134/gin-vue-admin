package attendace

import (
	"gorm.io/gorm/clause"
	"server/global"
	"server/model/attendance"
	request2 "server/model/common/request"
)

type AttendanceDateService struct{}

func (attendanceDateService *AttendanceDateService) GetAttendanceDateList(info request2.PageInfo) (attendanceDateList []attendance.AttendanceDate, total int64, err error) {
	limit := info.Limit
	offset := info.Limit * (info.Page - 1)
	db := global.GVA_DB.Model(&attendance.AttendanceDate{})
	deptId := info.DeptId
	if len(deptId) != 0 {
		db.Where("dept_id LIKE ?", "%"+deptId+"%")
	}
	err = db.Count(&total).Error
	db.Limit(limit).Offset(offset).Order("date").Find(&attendanceDateList)
	if err != nil {
		return
	}
	return attendanceDateList, total, err
}

func (attendanceDateService *AttendanceDateService) UpsetAttendanceDate(params attendance.AttendanceDate) error {
	tx := global.GVA_DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// 检查deptId是否为空
	if params.DeptId == "" {
		// 创建两个新的结构体实例，分别设置deptId为1和3
		paramsDept1 := params
		paramsDept1.DeptId = "1"
		paramsDept3 := params
		paramsDept3.DeptId = "3"

		// 尝试创建两条记录
		resultDept1 := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"date", "is_on_work", "click_in_time", "click_out_time", "dept_id"}),
		}).Create(&paramsDept1)

		resultDept3 := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"date", "is_on_work", "click_in_time", "click_out_time", "dept_id"}),
		}).Create(&paramsDept3)

		// 检查创建操作是否成功
		if resultDept1.Error != nil || resultDept3.Error != nil {
			tx.Rollback() // 回滚事务，因为创建或更新失败了
			if resultDept1.Error != nil {
				return resultDept1.Error
			}
			return resultDept3.Error
		}
	} else {
		// 如果deptId不为空，则按原逻辑执行
		result := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"date", "is_on_work", "click_in_time", "click_out_time", "dept_id"}),
		}).Create(&params)

		if result.Error != nil {
			tx.Rollback() // 回滚事务，因为创建或更新失败了
			return result.Error
		}
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return err
	}
	return nil
}
func (attendanceDateService *AttendanceDateService) DeleteAttendanceDate(params request2.DeleteIds) error {
	// 开始事务
	tx := global.GVA_DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	if err := tx.Where("id IN (?)", params.Ids).Delete(&attendance.AttendanceDate{}).Error; err != nil {
		tx.Rollback() // 如果有错误，回滚事务
		return err
	}
	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return err
	}
	return nil
}
