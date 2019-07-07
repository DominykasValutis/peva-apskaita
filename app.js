const 	mysql = require('mysql'),
		express = require('express'),
		session = require('express-session'),
		bodyParser = require('body-parser'),
		flash = require("connect-flash"),
		port = process.env.PORT || 3000,
		hostname = 'localhost',
		path = require('path'),
		app = express();

// Duombazes prisijungimas
var db_config = {
	host     : 'eu-cdbr-west-02.cleardb.net',
	user     : 'ba7638b3ca6abe',
	password : '7f48e2ab',
	database : 'heroku_c2c7cbf8250f549'
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(flash());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Prisijungimo puslapis
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Loginas
app.post('/auth', (request, response) => {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM `heroku_c2c7cbf8250f549`.`acc` WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/pagrindinis');
			} else {
				request.flash("error", "Neteisingas prisijungimo vardas arba slaptažodis!");
				response.redirect('/');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/pagrindinis', (req, res) => {
	if (req.session.loggedin) {
		connection.query('select * from heroku_c2c7cbf8250f549.taskas as t inner join heroku_c2c7cbf8250f549.gauta as g where g.pavadinimas = t.pavadinimas;', function(error, results, fields) {
            if (error) throw error;
            const result = results;
			console.log(result);
			res.render('pagrindinis', {result});
		});
	} else {
        res.redirect('/');
	}
});

// Apskaitos puslapio route
app.get('/apskaita/:id', (req, res) => {
    if (req.session.loggedin) {
		const id = req.params.id;
		connection.query('select * from heroku_c2c7cbf8250f549.taskas as t inner join heroku_c2c7cbf8250f549.gauta as g inner join heroku_c2c7cbf8250f549.nuimta as n inner join heroku_c2c7cbf8250f549.nuimta_pradzia as p where g.pavadinimas = (?) and t.pavadinimas = (?) and n.pavadinimas = (?) and p.pavadinimas = (?) and n.id = p.id', 
		[id, id, id, id], 
		function(error, result) {
			if (error) throw error;
			console.log(result);
			if (result.length > 0) {
				res.render('apskaita', {result: result});
				console.log(id);
			} else {
				connection.query('select * from heroku_c2c7cbf8250f549.taskas as t inner join heroku_c2c7cbf8250f549.gauta as g where g.pavadinimas = (?) and t.pavadinimas = (?)', [id, id], function(error, result) {
					res.render('apskaita', {result: result});
					console.log(id);
				});
			}
		});
	} else {
        res.redirect('/');
	}
});

app.post('/apskaita/:id', (req, res) => {
	const pilstomiLedai = req.body.minkstiledai;
	const kabinamiLedaiVnt = req.body.kabinamiledaivnt;
	const kabinamiLedai = req.body.kabinamiledai;
	const serbetas = req.body.serbetas;
	const stiklines02 = req.body.stiklines02;
	const stiklines03 = req.body.stiklines03;
	const stiklines05 = req.body.stiklines05;
	const kava = req.body.kava;
	const vafliuTesla = req.body.vafliutesla;
	const gerimai = req.body.gerimai1;
	const gerimai15 = req.body.gerimai5;
	const gerimai2 = req.body.gerimai2;
	const gerimai21 = req.body.gerimai21;
	const fasuoti1 = req.body.fasuoti1;
	const fasuoti12 = req.body.fasuoti12;
	const fasuoti15 = req.body.fasuoti15;
	const fasuoti17 = req.body.fasuoti17;
	const fasuoti2 = req.body.fasuoti2;
	const fasuoti25 = req.body.fasuoti25;
	const id = req.params.id;
	connection.query(
		'UPDATE `heroku_c2c7cbf8250f549`.`taskas` SET minkstiledai = minkstiledai + (?), kabinamiledaivnt = kabinamiledaivnt + (?), kabinamiledai = kabinamiledai + (?), serbetas = serbetas + (?), stiklines02 = stiklines02 + (?), stiklines03 = stiklines03 + (?), stiklines05 = stiklines05 + (?), kava = kava + (?), vafliutesla = vafliutesla + (?), gerimai1 = gerimai1 + (?), gerimai15 = gerimai15 + (?), gerimai2 = gerimai2 + (?), gerimai21 = gerimai21 + (?), fasuoti1 = fasuoti1 + (?), fasuoti12 = fasuoti12 + (?), fasuoti15 = fasuoti15 + (?), fasuoti17 = fasuoti17 + (?), fasuoti2 = fasuoti2 + (?), fasuoti25 = fasuoti25 + (?) WHERE tasko_ID = (?)', 
	[pilstomiLedai, kabinamiLedaiVnt, kabinamiLedai, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai, gerimai15, gerimai2, gerimai21, fasuoti1, fasuoti12, fasuoti15, fasuoti17, fasuoti2, fasuoti25, id],
	function(error, result) {
		if(error) throw error;
		console.log(id);
	});
	connection.query(
		'UPDATE `heroku_c2c7cbf8250f549`.`atvezta` SET atveztaMinksti = atveztaMinksti + (?), atveztaKabinamiledaivnt = atveztaKabinamiledaivnt + (?), atveztaKabinami = atveztaKabinami + (?), atveztaSerbetas = atveztaSerbetas + (?), atveztaStiklines02 = atveztaStiklines02 + (?), atveztaStiklines03 = atveztaStiklines03 + (?), atveztaStiklines05 = atveztaStiklines05 + (?), atveztaKava = atveztaKava + (?), atveztaVafliutesla = atveztaVafliutesla + (?), atveztaGerimai1 = atveztaGerimai1 + (?), atveztaGerimai15 = atveztaGerimai15 + (?), atveztaGerimai2 = atveztaGerimai2 + (?), atveztaGerimai21 = atveztaGerimai21 + (?), atveztaFasuoti1 = atveztaFasuoti1 + (?), atveztaFasuoti12 = atveztaFasuoti12 + (?), atveztaFasuoti15 = atveztaFasuoti15 + (?), atveztaFasuoti17 = atveztaFasuoti17 + (?), atveztaFasuoti2 = atveztaFasuoti2 + (?), atveztaFasuoti25 = atveztaFasuoti25 + (?) WHERE tasko_ID = (?)', 
	[pilstomiLedai, kabinamiLedaiVnt, kabinamiLedai, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai, gerimai15, gerimai2, gerimai21, fasuoti1, fasuoti12, fasuoti15, fasuoti17, fasuoti2, fasuoti25, id], 
	function(error, result) {
		if(error) throw error;
		console.log(id);
	});
	res.redirect('back');
});

app.post('/nuemimas/:id', (req,res) => {
	const pilstomiLedai = req.body.nuimtaMinksti;
	const kabinamiLedaiVnt = req.body.nuimtaKabinamiledaivnt;
	const kabinamiLedai = req.body.nuimtaKabinami;
	const serbetas = req.body.nuimtaSerbetas;
	const stiklines02 = req.body.nuimtaStiklines02;
	const stiklines03 = req.body.nuimtaStiklines03;
	const stiklines05 = req.body.nuimtaStiklines05;
	const kava = req.body.nuimtaKava;
	const vafliuTesla = req.body.nuimtaVafliutesla;
	const gerimai1 = req.body.nuimtaGerimai1;
	const gerimai15 = req.body.nuimtaGerimai15;
	const gerimai2 = req.body.nuimtaGerimai2;
	const gerimai21 = req.body.nuimtaGerimai21;
	const fasuoti1 = req.body.nuimtaFasuoti1;
	const fasuoti12 = req.body.nuimtaFasuoti12;
	const fasuoti15 = req.body.nuimtaFasuoti15;
	const fasuoti17 = req.body.nuimtaFasuoti17;
	const fasuoti2 = req.body.nuimtaFasuoti2;
	const fasuoti25 = req.body.nuimtaFasuoti25;
	const pavadinimas = req.body.pavadinimas;
	const data = req.body.data;
	const id = req.params.id;
	connection.query(
		'INSERT INTO heroku_c2c7cbf8250f549.nuimta (nuimtaMinksti, nuimtaKabinamiledaivnt, nuimtaKabinami, nuimtaSerbetas, nuimtaStiklines02, nuimtaStiklines03, nuimtaStiklines05, nuimtaKava, nuimtaVafliutesla, nuimtaGerimai1, nuimtaGerimai15, nuimtaGerimai2, nuimtaGerimai21, nuimtaFasuoti1, nuimtaFasuoti12, nuimtaFasuoti15, nuimtaFasuoti17, nuimtaFasuoti2, nuimtaFasuoti25, pavadinimas, data) VALUES ((?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?));',
		[pilstomiLedai, kabinamiLedaiVnt, kabinamiLedai, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai1, gerimai15, gerimai2, gerimai21, fasuoti1, fasuoti12, fasuoti15, fasuoti17, fasuoti2, fasuoti25, pavadinimas, data],
		function(error, result) {
			if (error) throw error;
		});
	connection.query(
		'insert into heroku_c2c7cbf8250f549.nuimta_pradzia (nuimta_pradziaMinksti, nuimta_pradziaKabinamiledaivnt, nuimta_pradziaKabinami, nuimta_pradziaSerbetas, nuimta_pradziaStiklines02, nuimta_pradziaStiklines03, nuimta_pradziaStiklines05, nuimta_pradziaKava, nuimta_pradziaVafliutesla, nuimta_pradziaGerimai1, nuimta_pradziaGerimai15, nuimta_pradziaGerimai2,  nuimta_pradziaGerimai21, nuimta_pradziaFasuoti1, nuimta_pradziaFasuoti12, nuimta_pradziaFasuoti15, nuimta_pradziaFasuoti17, nuimta_pradziaFasuoti2, nuimta_pradziaFasuoti25, pavadinimas) select atveztaMinksti, atveztaKabinamiledaivnt, atveztaKabinami, atveztaSerbetas, atveztaStiklines02, atveztaStiklines03, atveztaStiklines05, atveztaKava, atveztaVafliutesla, atveztaGerimai1, atveztaGerimai15, atveztaGerimai2, atveztaGerimai21, atveztaFasuoti1, atveztaFasuoti12, atveztaFasuoti15, atveztaFasuoti17, atveztaFasuoti2, atveztaFasuoti25, pavadinimas from heroku_c2c7cbf8250f549.atvezta where heroku_c2c7cbf8250f549.atvezta.tasko_ID = (?)',
		[id], function(error, result) {
			if (error) throw error;
			console.log(result);
		});
	connection.query('UPDATE `heroku_c2c7cbf8250f549`.`atvezta` SET atveztaMinksti = (?), atveztaKabinami = (?), atveztaKabinamiledaivnt = (?), atveztaSerbetas = (?), atveztaStiklines02 = (?), atveztaStiklines03 = (?), atveztaStiklines05 = (?), atveztaKava = (?), atveztaVafliutesla = (?), atveztaGerimai1 = (?), atveztaGerimai15 = (?), atveztaGerimai2 = (?), atveztaGerimai21 = (?), atveztaFasuoti1 = (?), atveztaFasuoti12 = (?), atveztaFasuoti15 = (?), atveztaFasuoti17 = (?), atveztaFasuoti2 = (?), atveztaFasuoti25 = (?) WHERE tasko_ID = (?)',
		[pilstomiLedai, kabinamiLedai, kabinamiLedaiVnt, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai1, gerimai15, gerimai2, gerimai21, fasuoti1, fasuoti12, fasuoti15, fasuoti17, fasuoti2, fasuoti25, id], function(error, result) {
		if (error) throw error;
		console.log(result);
	});
	res.redirect('back');
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});