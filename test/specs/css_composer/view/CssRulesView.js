const CssRulesView = require('css_composer/view/CssRulesView');
const CssRules = require('css_composer/model/CssRules');
const Editor = require('editor/model/Editor');

module.exports = {
  run() {
    describe('CssRulesView', () => {
      let obj;
      const prefix = 'rules';
      const devices = [
        {
          name: 'Mobile portrait',
          width: '320px',
          widthMedia: '480px'
        },
        {
          name: 'Tablet',
          width: '768px',
          widthMedia: '992px'
        },
        {
          name: 'Desktop',
          width: '',
          widthMedia: ''
        }
      ];

      beforeEach(function() {
        const col = new CssRules([]);
        obj = new CssRulesView({
          collection: col,
          config: {
            em: new Editor({
              deviceManager: {
                devices
              }
            })
          }
        });
        document.body.innerHTML = '<div id="fixtures"></div>';
        document.body.querySelector('#fixtures').appendChild(obj.render().el);
      });

      afterEach(() => {
        obj.collection.reset();
      });

      it('Object exists', () => {
        expect(CssRulesView).toExist();
      });

      it('Collection is empty. Styles structure bootstraped', () => {
        expect(obj.$el.html()).toExist();
        const foundStylesContainers = obj.$el.find('div');
        expect(foundStylesContainers.length).toEqual(devices.length);

        const sortedDevicesWidthMedia = devices
          .map(dvc => dvc.widthMedia)
          .sort((left, right) => {
            return (
              ((right && right.replace('px', '')) || Number.MAX_VALUE) -
              ((left && left.replace('px', '')) || Number.MAX_VALUE)
            );
          });
        foundStylesContainers.each(($styleC, idx) => {
          const width = sortedDevicesWidthMedia[idx];
          expect($styleC.id).toEqual(`${prefix}${width ? `-${width}` : ''}`);
        });
      });

      it('Add new rule', () => {
        sinon.stub(obj, 'addToCollection');
        obj.collection.add({});
        expect(obj.addToCollection.calledOnce).toExist(true);
      });

      it('Add correctly rules with different media queries', () => {
        const foundStylesContainers = obj.$el.find('div');
        const rules = [
          {
            selectorsAdd: '#testid'
          },
          {
            selectorsAdd: '#testid2',
            mediaText: '(max-width: 1000px)'
          },
          {
            selectorsAdd: '#testid2',
            mediaText: 'screen and (max-width: 900px) and (min-width: 600px)'
          }
        ];
        obj.collection.add(rules);
        const stylesCont = obj.el.querySelector(`#${obj.className}`);
        expect(stylesCont.children.length).toEqual(rules.length);
      });

      it('Render new rule', () => {
        obj.collection.add({});
        expect(obj.$el.find(`#${prefix}`).html()).toExist();
      });
    });
  }
};
