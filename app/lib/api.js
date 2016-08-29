export default {
    post(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/${url}`,
                data: JSON.stringify(data),
                method: 'post',
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(resolve)
            .fail(reject);
        });
    },

    get(url, data = {}) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/${url}`,
                data,
            })
            .done(resolve)
            .fail(reject);
        });
    },
};

