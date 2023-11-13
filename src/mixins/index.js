export default {
  data() {

  },
  methods: {
    handleInvokeFunctions(functions, customOptions = {}) {
      const results = []
      if(functions && functions.length > 0) {
          functions.forEach(func => {
              const result = window[func.name].call(this, {
                  _this: this,
                  ...IDM.url.queryObject(),
                  ...(func.param || {}),
                  ...customOptions
              })
              results.push(result)
          })
      }
      return results
    },
  }
}