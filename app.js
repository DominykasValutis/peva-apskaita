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
const pool = mysql.createPool({
	host     : 'eu-cdbr-west-02.cleardb.net',
	user     : 'ba7638b3ca6abe',
	password : '7f48e2ab',
	database : 'heroku_c2c7cbf8250f549'
});

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

pool.connect(function(error) {
    if(error) throw error;
    console.log('Database connection established...');
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
		pool.query('SELECT * FROM `heroku_c2c7cbf8250f549`.`acc` WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/pagrindinis');
			} else {
				request.flash("error", "Neteisingas prisijungimo vardas arba slaptažodis!");
				response.redirect('/apskaita');
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
		pool.query('select * from heroku_c2c7cbf8250f549.taskas as t inner join heroku_c2c7cbf8250f549.gauta as g where g.pavadinimas = t.pavadinimas;', function(error, results, fields) {
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
		pool.query('select * from heroku_c2c7cbf8250f549.taskas as t inner join heroku_c2c7cbf8250f549.gauta as g inner join heroku_c2c7cbf8250f549.nuimta as n inner join heroku_c2c7cbf8250f549.nuimta_pradzia as p where g.pavadinimas = (?) and t.pavadinimas = (?) and n.pavadinimas = (?) and p.pavadinimas = (?) and n.id = p.id', 
		[id, id, id, id], 
		function(error, result) {
			if (error) throw error;
			console.log(result);
			if (result.length > 0) {
				res.render('apskaita', {result: result});
				console.log(id);
			} else {
				pool.query('select * from heroku_c2c7cbf8250f549.taskas as t inner join heroku_c2c7cbf8250f549.gauta as g where g.pavadinimas = (?) and t.pavadinimas = (?)', [id, id], function(error, result) {
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
	const id = req.params.id;
	pool.query(
		'UPDATE `heroku_c2c7cbf8250f549`.`taskas` SET minkstiledai = minkstiledai + (?), kabinamiledaivnt = kabinamiledaivnt + (?), kabinamiledai = kabinamiledai + (?), serbetas = serbetas + (?), stiklines02 = stiklines02 + (?), stiklines03 = stiklines03 + (?), stiklines05 = stiklines05 + (?), kava = kava + (?), vafliutesla = vafliutesla + (?), gerimai1 = gerimai1 + (?), gerimai15 = gerimai15 + (?), gerimai2 = gerimai2 + (?) WHERE tasko_ID = (?)', 
	[pilstomiLedai, kabinamiLedaiVnt, kabinamiLedai, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai, gerimai15, gerimai2, id],
	function(error, result) {
		if(error) throw error;
		console.log(id);
	});
	pool.query(
		'UPDATE `heroku_c2c7cbf8250f549`.`atvezta` SET atveztaMinksti = atveztaMinksti + (?), atveztaKabinamiledaivnt = atveztaKabinamiledaivnt + (?), atveztaKabinami = atveztaKabinami + (?), atveztaSerbetas = atveztaSerbetas + (?), atveztaStiklines02 = atveztaStiklines02 + (?), atveztaStiklines03 = atveztaStiklines03 + (?), atveztaStiklines05 = atveztaStiklines05 + (?), atveztaKava = atveztaKava + (?), atveztaVafliutesla = atveztaVafliutesla + (?), atveztaGerimai1 = atveztaGerimai1 + (?), atveztaGerimai15 = atveztaGerimai15 + (?), atveztaGerimai2 = atveztaGerimai2 + (?) WHERE tasko_ID = (?)', 
	[pilstomiLedai, kabinamiLedaiVnt, kabinamiLedai, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai, gerimai15, gerimai2, id], 
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
	const pavadinimas = req.body.pavadinimas;
	const data = req.body.data;
	const id = req.params.id;
	pool.query(
		'INSERT INTO heroku_c2c7cbf8250f549.nuimta (nuimtaMinksti, nuimtaKabinamiledaivnt, nuimtaKabinami, nuimtaSerbetas, nuimtaStiklines02, nuimtaStiklines03, nuimtaStiklines05, nuimtaKava, nuimtaVafliutesla, nuimtaGerimai1, nuimtaGerimai15, nuimtaGerimai2, pavadinimas, data) VALUES ((?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?));',
		[pilstomiLedai, kabinamiLedaiVnt, kabinamiLedai, serbetas, stiklines02, stiklines03, stiklines05, kava, vafliuTesla, gerimai1, gerimai15, gerimai2, pavadinimas, data],
		function(error, result) {
			if (error) throw error;
		});
		pool.query(
		'insert into heroku_c2c7cbf8250f549.nuimta_pradzia (nuimta_pradziaMinksti, nuimta_pradziaKabinamiledaivnt, nuimta_pradziaKabinami, nuimta_pradziaSerbetas, nuimta_pradziaStiklines02, nuimta_pradziaStiklines03, nuimta_pradziaStiklines05, nuimta_pradziaKava, nuimta_pradziaVafliutesla, nuimta_pradziaGerimai1, nuimta_pradziaGerimai15, nuimta_pradziaGerimai2, pavadinimas) select atveztaMinksti, atveztaKabinamiledaivnt, atveztaKabinami, atveztaSerbetas, atveztaStiklines02, atveztaStiklines03, atveztaStiklines05, atveztaKava, atveztaVafliutesla, atveztaGerimai1, atveztaGerimai15, atveztaGerimai2, pavadinimas from heroku_c2c7cbf8250f549.atvezta where heroku_c2c7cbf8250f549.atvezta.tasko_ID = (?)',
		[id], function(error, result) {
			if (error) throw error;
			console.log(result);
		});
		pool.query('UPDATE `heroku_c2c7cbf8250f549`.`atvezta` SET atveztaMinksti = 0, atveztaKabinamiledaivnt = 0, atveztaKabinami = 0, atveztaSerbetas = 0, atveztaStiklines02 = 0, atveztaStiklines03 = 0, atveztaStiklines05 = 0, atveztaKava = 0, atveztaVafliutesla = 0, atveztaGerimai1 = 0, atveztaGerimai15 = 0, atveztaGerimai2 = 0 WHERE tasko_ID = (?)',
	[id], function(error, result) {
		if (error) throw error;
		console.log(result);
	});
	res.redirect('back');
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});