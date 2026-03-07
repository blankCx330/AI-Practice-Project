/**
 * FormValidator - 表单验证工具
 * 提供实时验证反馈
 */

const FormValidator = {
  /**
   * 验证规则
   */
  rules: {
    title: {
      required: true,
      minLength: 1,
      maxLength: 100,
      messages: {
        required: '计划标题不能为空',
        minLength: '标题长度至少1个字符',
        maxLength: '标题长度不能超过100个字符'
      }
    },
    type: {
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'longterm'],
      messages: {
        required: '请选择计划类型',
        enum: '无效的计划类型'
      }
    },
    status: {
      required: true,
      enum: ['pending', 'in_progress', 'completed'],
      messages: {
        required: '请选择计划状态',
        enum: '无效的计划状态'
      }
    },
    progress: {
      required: true,
      min: 0,
      max: 100,
      messages: {
        required: '请设置进度',
        min: '进度不能小于0',
        max: '进度不能超过100'
      }
    },
    startDate: {
      required: false,
      dateFormat: 'YYYY-MM-DD',
      messages: {
        dateFormat: '日期格式无效'
      }
    },
    endDate: {
      required: false,
      dateFormat: 'YYYY-MM-DD',
      compare: 'startDate',
      messages: {
        dateFormat: '日期格式无效',
        compare: '截止日期不能早于开始日期'
      }
    }
  },

  /**
   * 验证单个字段
   * @param {string} fieldName - 字段名
   * @param {*} value - 字段值
   * @param {Object} allValues - 所有字段值（用于比较验证）
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validateField(fieldName, value, allValues = {}) {
    const rule = this.rules[fieldName];
    if (!rule) return { valid: true, errors: [] };

    const errors = [];

    // 必填验证
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(rule.messages.required);
      return { valid: false, errors };
    }

    // 如果不是必填且为空，则跳过其他验证
    if (!rule.required && (!value || value.toString().trim() === '')) {
      return { valid: true, errors: [] };
    }

    // 最小长度验证
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(rule.messages.minLength);
    }

    // 最大长度验证
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(rule.messages.maxLength);
    }

    // 枚举验证
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(rule.messages.enum);
    }

    // 最小值验证
    if (rule.min !== undefined && value < rule.min) {
      errors.push(rule.messages.min);
    }

    // 最大值验证
    if (rule.max !== undefined && value > rule.max) {
      errors.push(rule.messages.max);
    }

    // 日期格式验证
    if (rule.dateFormat && value) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value) || !window.DateUtils.isValidDate(value)) {
        errors.push(rule.messages.dateFormat);
      }
    }

    // 日期比较验证
    if (rule.compare && value && allValues[rule.compare]) {
      const compareValue = allValues[rule.compare];
      if (value < compareValue) {
        errors.push(rule.messages.compare);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * 验证整个表单
   * @param {Object} values - 表单值
   * @returns {Object} { valid: boolean, errors: Object }
   */
  validateForm(values) {
    const errors = {};
    let isValid = true;

    for (const fieldName of Object.keys(this.rules)) {
      const result = this.validateField(fieldName, values[fieldName], values);
      if (!result.valid) {
        errors[fieldName] = result.errors;
        isValid = false;
      }
    }

    return { valid: isValid, errors };
  },

  /**
   * 显示字段错误提示
   * @param {string} fieldName - 字段名
   * @param {string[]} errors - 错误消息数组
   */
  showFieldError(fieldName, errors) {
    const field = document.getElementById(`plan${this.capitalize(fieldName)}`);
    if (!field) return;

    // 移除之前的错误提示
    this.clearFieldError(fieldName);

    // 添加错误样式
    field.classList.add('input--error');

    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.id = `${fieldName}Error`;
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 13px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    errorDiv.innerHTML = `
      <span>⚠</span>
      <span>${errors[0]}</span>
    `;

    // 插入到字段后面
    field.parentElement.appendChild(errorDiv);
  },

  /**
   * 清除字段错误提示
   * @param {string} fieldName - 字段名
   */
  clearFieldError(fieldName) {
    const field = document.getElementById(`plan${this.capitalize(fieldName)}`);
    if (field) {
      field.classList.remove('input--error');
    }

    const errorDiv = document.getElementById(`${fieldName}Error`);
    if (errorDiv) {
      errorDiv.remove();
    }
  },

  /**
   * 清除所有错误提示
   */
  clearAllErrors() {
    for (const fieldName of Object.keys(this.rules)) {
      this.clearFieldError(fieldName);
    }
  },

  /**
   * 首字母大写
   * @param {string} str - 字符串
   * @returns {string} 首字母大写后的字符串
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 绑定实时验证
   */
  bindRealTimeValidation() {
    // 标题字段
    const titleField = document.getElementById('planTitle');
    titleField?.addEventListener('blur', (e) => {
      const result = this.validateField('title', e.target.value);
      if (!result.valid) {
        this.showFieldError('title', result.errors);
      } else {
        this.clearFieldError('title');
      }
    });

    titleField?.addEventListener('input', () => {
      this.clearFieldError('title');
    });

    // 日期字段
    const startDateField = document.getElementById('planStartDate');
    const endDateField = document.getElementById('planEndDate');

    endDateField?.addEventListener('change', (e) => {
      const startDate = startDateField?.value;
      const endDate = e.target.value;
      
      const result = this.validateField('endDate', endDate, { startDate });
      if (!result.valid) {
        this.showFieldError('endDate', result.errors);
      } else {
        this.clearFieldError('endDate');
      }
    });
  }
};

// 导出到全局
window.FormValidator = FormValidator;