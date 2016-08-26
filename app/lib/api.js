export default {
    post(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/${url}`,
                data,
                method: 'post',
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(resolve)
            .fail(reject);
        });
    },

    get(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/${url}`,
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(resolve)
            .fail(reject);
        });
    },
};

