import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import { lightBlue500 } from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import DropzoneComponent from 'react-dropzone-component';
import Highlight from 'react-highlight';
import 'react-dropzone-component/styles/filepicker.css';
import 'dropzone/dist/min/dropzone.min.css';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { transform } from 'babel-standalone';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem'
import translateApi from 'yandex-translate';

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 50,
    paddingBottom: 50
  },
  card: {
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 25
  }
};
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: lightBlue500
  }
});

class App extends Component {
  state = {
    singleQuotes: true,
    open: false,
    inputString: null,
    strings: [],
    outputString: null,
    language: 'pl',
    translated: false 
  };

  djsConfig = {
    autoProcessQueue: false
  };

  config = {
    iconFiletypes: ['.js', '.jsx', '.json'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
  };

  languages = [
    {langauge: 'English', iso: 'en'},
    {langauge: 'Polish', iso: 'pl'},
    {langauge: 'Chinese (Simplified)', iso: 'zh-CN'},
    {langauge: 'Italian', iso: 'it'},
    {langauge: 'German', iso: 'ger'}
  ];
  client = translateApi('trnsl.1.1.20170811T043041Z.475a1cddd6be741d.b7505ef241050ea653bded561a7cb2a55d721f35');

  getMatches = (s, re) => {
    let m;
    let results = [];
    do {
        m = re.exec(s);
        if (m) {
            results = [...results, {value: m[1], translate: false, translation: null}];
            console.log(m[1]);
        }
    } while (m);
    return results;
  }
  translate = (str) => {
    const transcribe = this;
    this.client.translate(str, { to: this.state.language }, function(err, res) {
      if(res.text[0]){
        const updatedStrings = transcribe.state.strings.map((element, i) => {
          return element.value === str ?
          {...element, translation: res.text[0] } :
          element;
        });
        transcribe.setState({strings: updatedStrings, translated: true});
      }
      console.log(res.text[0]);
    });
  }
  handleTranslate = () => {
    const transcribe = this;
    this.state.strings.forEach((element, i) => {
      if(element.translate){
        let newElement = element;
        newElement.translation = transcribe.translate(element.value);
      }
    });
  }

  handleCheckboxChange = (e) => {
    const str = e.target.value;
    const updatedStrings = this.state.strings.map((element, i) => {
      return element.value === str ?
      {...element, translate: !element.translate } :
      element;
    });
    this.setState({strings: updatedStrings});

  }

  translateScript = () => {
    let script = this.state.inputString.content;
    this.state.strings.forEach((element, i) => {
      if(element.translate && element.translation){
        const replace = element.value;
        const re = new RegExp(replace,"g");
        script = script.replace(re, element.translation);
      }
    }
    );
    this.setState({outputString: script})
  }

  handleGetStrings = () => {
    const sourceCode = this.state.inputString.content;
    const regExp = /'((?:\\.|[^'\\])*)'/g;
    
    const strings = this.getMatches(sourceCode, regExp);
    this.setState({strings: strings});
    console.log(strings);
  };

  eventHandlers = {
    addedfile: file => this.handleFile(file, this)
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleTouchTap = () => {
    this.setState({
      open: true
    });
  };

  handleFile = (file, transcribe) => {
    let fileRead = file,
      read = new FileReader();

    read.readAsBinaryString(fileRead);

    read.onloadend = function() {
      transcribe.setState({
        inputString: { content: read.result, name: file.name, type: file.type }
      });
      console.log(read.result);
    };
  };
  renderList = () => {
    const list = this.state.strings.map((element, i) => {
      return <ListItem key={`li-${i}`} primaryText={element.translation ? element.value +'  ➡️  '+element.translation : element.value} leftCheckbox={<Checkbox checked={element.translate} value={element.value} onClick={this.handleCheckboxChange}/>} />
  });
  return list;
  }

  renderLanguages = () => {
    const items = this.languages.map((element, i) => {
      return (<MenuItem value={element.iso} key={element.iso+'-'+i} primaryText={element.langauge} />);
    });  
    return items;
  }

  handleLanguageChange = (event, index, value) => {
    this.setState({language: value});
  };

  render = () => {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleRequestClose}
      />
    );
    const { inputString, open, strings } = this.state;

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <div style={styles.container}>
            <Dialog
              open={open && !inputString}
              title="Upload your file"
              actions={standardActions}
              onRequestClose={this.handleRequestClose}
            >
              <DropzoneComponent
                config={this.config}
                eventHandlers={this.eventHandlers}
                djsConfig={this.djsConfig}
              />
            </Dialog>
            <h1>✍️ TRANSCRIBE 🌏</h1>
            <h2>translate your script</h2>
            {!inputString &&
              <RaisedButton
                label="Upload your file"
                secondary={true}
                onTouchTap={this.handleTouchTap}
              />}
          </div>
          {inputString &&
            <Card style={styles.card}>
              <CardHeader
                title={inputString.name}
                subtitle={inputString.type}
                actAsExpander={true}
                showExpandableButton={true}
              />
              {!strings.length && 
              <CardActions>
                <FlatButton
                  label="Get Strings"
                  onTouchTap={this.handleGetStrings}
                />
              </CardActions>}
              {this.state.translated && !this.state.outputString && 
              <CardActions>
                <FlatButton
                  label="Translate Script"
                  onTouchTap={this.translateScript}
                />
              </CardActions>}
              
              <CardText expandable={true}>
                <Highlight className="javascript">
                  {this.state.outputString ? this.state.outputString : inputString.content}
                </Highlight>
              </CardText>
            </Card>}
            {!!strings.length &&
              <Card style={styles.card}>
                <CardHeader
                  title='strings to translate'
                  subtitle={'found: '+strings.length}
                  actAsExpander={true}
                  showExpandableButton={true}
                />
                <CardActions>
                  <FlatButton label="Translate" 
                  onTouchTap={this.handleTranslate}/>
                </CardActions>
                <CardText expandable={true}>
                  <SelectField
                    value={this.state.language}
                    onChange={this.handleLanguageChange}
                    maxHeight={300}
                  >
                    {this.renderLanguages()}
                  </SelectField>
                <List>
                  <Subheader>Pick strings to translate</Subheader>
                  {this.renderList()}
                  
                </List>
                </CardText>
              </Card>}
        </div>
      </MuiThemeProvider>
    );
  };
}

export default App;
