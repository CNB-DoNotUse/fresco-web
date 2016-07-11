import React, { PropTypes } from 'react';
import GalleryListItem from './admin-gallery-list-item';
import AdminGalleryEdit from './admin-gallery-edit';
import findIndex from 'lodash/findIndex';
import omit from 'lodash/omit';

// TODO: Imports and Submissions should maybe still be one cmp
// (depending on future differences if any)
class Imports extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasActiveImport: false,
            activeImport: {},
        };

        this.setActiveImport = this.setActiveImport.bind(this);
        this.skip = this.skip.bind(this);
        this.verify = this.verify.bind(this);
        this.remove = this.remove.bind(this);
        this.scroll = this.scroll.bind(this);
    }

    onUpdateImport(id) {
        const { removeImport, imports } = this.props;
        const index = findIndex(imports, { id });

        if (imports[index + 1]) {
            this.setState({ activeImport: imports[index + 1] },
                () => removeImport(id));
        } else {
            this.setState({ activeImport: null }, () => removeImport(id));
        }
    }

    setActiveImport(activeImport) {
        this.setState({ activeImport });
    }

    remove(id) {
        $.ajax({
            url: `/api/gallery/${id}/delete`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ id: this.state.activeImport.id }),
            dataType: 'json',
            success: () => {
                this.onUpdateImport(id);
            },
            // error: (xhr, status, error) => {
            //     cb(error);
            // },
        });
    }

    skip(id) {
        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                id: this.state.activeImport.id,
                rated: 1,
                visibility: 0,
            }),
            dataType: 'json',
            success: () => {
                this.onUpdateImport(id);
            },
            // error: (xhr, status, error) => {
            //     cb(error);
            // },
        });
    }


    verify(params, cb) {
        const { id } = params;
        if (!id || !cb) return;
        let data = Object.assign({}, params, { rating: 2 });
        data = omit(data, 'id');

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: () => {
                this.onUpdateImport(id);
                cb(null, id);
            },
            error: (xhr, status, error) => {
                cb(error);
            },
        });
    }

    scroll(e) {
        const { getData, imports } = this.props;
        const target = e.target;

        if (target.scrollTop === target.scrollHeight - target.offsetHeight) {
            if (!imports || !imports.length) return;

            getData(imports[imports.length - 1].id, {
                concat: true,
                tab: 'imports',
            },
            null);
        }
    }

    renderImports() {
        const { imports } = this.props;
        const { activeImport } = this.state;

        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        return imports.sort(sortListItem).map((gallery, i) => (
            <GalleryListItem
                type="import"
                gallery={gallery}
                key={i}
                active={(activeImport && activeImport.id === gallery.id) || false}
                setActiveGallery={() => this.setActiveImport(gallery)}
            />
        ));
    }

    render() {
        const { activeImport } = this.state;
        let editPane = '';

        if (activeImport && activeImport.id) {
            editPane = (
                <AdminGalleryEdit
                    hasActiveGallery
                    activeGalleryType={'imports'}
                    gallery={activeImport}
                    skip={this.skip}
                    verify={this.verify}
                    remove={this.remove}
                />
            );
        }

        return (
            <div className="container-fluid admin">
                <div className="col-md-6 col-lg-7 list" onScroll={this.scroll}>
                    {this.renderImports()}
                </div>
                <div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
                    {editPane}
                </div>
            </div>
        );
    }
}

Imports.propTypes = {
    removeImport: PropTypes.func.isRequired,
    imports: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
};

export default Imports;

